import React from 'react';
import { selectRow, updateAvailableFilters, hoverProduct, dtmEvent } from '../../actions/ActionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

//images
import EvaluationBoard from '../../img/psd/eval-board.png';
import ReferenceCircuit from '../../img/psd/reference-circuit.png';

import './style.css';

class Row extends React.Component {

    constructor( props ){
        super( props );
        
        this.state = {
            display: true,
            selected: this.isSelected( props.selectedRows, props.product.id )
        };
    }

    /**
     * If any new functionality is added to the PST app involving the display of the rows, a condition for it
     * needs to be handled here. We are including this method to reduce memory usage for large tables 
     * (i.e. tables with more than 400 rows).
     * 
     * IE11 sees the greatest performance hit without this method, however, other browsers do benefit noticeably 
     * from adding this restriction.
     */
    shouldComponentUpdate( nextProps ){
        let condition1 = nextProps.product.id !== this.props.product.id, // if the component will show a new product
        condition2 = this.isSelected( nextProps.selectedRows, nextProps.product.id ) !== this.state.selected, // if the component is becomming selected
        condition3 = nextProps.compareState !== this.props.compareState, // if the compare state has changed
        condition4 = JSON.stringify( nextProps.showStateArray ) !== JSON.stringify( this.props.showStateArray ), // if different columns are beind displayed
        condition5 = JSON.stringify( nextProps.columns ) !== JSON.stringify( this.props.columns ); // if columns are in a different order
        return ( condition1 || condition2 || condition3 || condition4 || condition5 );
    }

    componentWillReceiveProps( nextProps ){
        let selected = this.isSelected( nextProps.selectedRows, nextProps.product.id );
        this.setState({ selected });
    }

    /**
     * @name isSelected
     * @function
     * @param {*} selectedRows 
     * @param {*} id 
     * @returns {boolean} Whether the the row should be selected or not
     * @description Determines if the row should be selected
     */
    isSelected( selectedRows, id ){
        let row = selectedRows.find( row => row.id === id );
        return ( row ) ? row.selected : false;
    }

    /**
     * @name selectRow
     * @function
     * @param {Object} e Browser event object
     * @description Updates the component as selected
     */
    selectRow = e => this.props.selectRow( this.props.product.id, !this.state.selected, this.props.selectedRows );

    /**
     * @name isNew
     * @function 
     * @param {string} value 
     * @returns {JSX.Element|null} 
     * @description Renders the "new" label used in `Row.renderProduct()`
     */
    isNew = value => ( value !== 'No' ) ? ( <span className="new-label">NEW</span> ) : null;

    /**
     * @name tooltip
     * @function
     * @param {string} icon Text to be displayed in the tooltip
     * @returns {React.Component}
     * @description Renders the tooltip component used in `Row.renderHardware()`
     */
    tooltip = icon => <Tooltip id="tooltip">{ icon }</Tooltip>

    /**
     * @name renderHardware
     * @function
     * @param {string} field 
     * @param {array} icons 
     * @returns {JSX.Element}
     * @description Renders the cell for the hardware column.
     */
    renderHardware( field, icons ){
        
        let id = `${ this.props.product.id }-${ field }`,
        loc = document.createElement( 'a' ),
        url = this.props.product[ 0 ].generic,
        shortUrl;
        loc.href = this.props.product[ 0 ].evalBoardUrl;
        shortUrl = `//${ loc.host }/${ this.props.language || 'en' }/${ url }#product-designs`;
        
        return(
            <div key={ id } className={ `checkboxes text-center ${ field }` }>
                { 
                    icons.map( ( icon, index ) => {
                        if( icon === 'Evaluation board' ) return ( 
                            <OverlayTrigger placement="top" key={ `${ id }-eval-tooltip` } overlay={this.tooltip(icon)}>
                                <a href={this.props.product[ 0 ].evalBoardUrl}><img key={ `${ id }-eval` } src={ EvaluationBoard } alt="EvaluationBoard" /></a>
                            </OverlayTrigger> );

                        if( icon === 'Reference circuit' ) return (
                            <OverlayTrigger placement="top" key={ `${ id }-reference-tooltip` } overlay={this.tooltip(icon)}>
                                <a href={shortUrl}><img key={ `${ id }-reference` } src={ ReferenceCircuit } className="referncecircuit" alt="ReferenceCircuit" /></a>
                            </OverlayTrigger> );

                        return ( <div key={ index }>-</div> );
                    })
                }
            </div>
        );
    }

    /**
     * @name renderProduct
     * @function
     * @param {string} field
     * @returns {JSX.Element} 
     * @description Renders the cell for the product name column
     */
    renderProduct = field => {

        let id = `${ this.props.product.id }-${ field }`,
        loc = document.createElement( 'a' ),
        url = this.props.product[ field ].generic,
        shortUrl;
        loc.href = this.props.product[ field ].evalBoardUrl;
        shortUrl = `//${ loc.host }/${ this.props.language || 'en' }/${ url }`;

        return(
            <div 
                key={ id } 
                className={ `pop-holder ${ field } sticky` } 
                ref="popupContainer"
                id={ id }
                onMouseLeave={ this.hidePopup }>
                    <div 
                        className="content"
                        data-id={ id }
                        onMouseEnter={ e => this.dispatchPopup( e, id, field ) }>
                        <a 
                            href={ shortUrl }
                            onClick={ e=> this.props.dtmEvent( 'productView' ) }
                            target="_blank">
                                { this.props.product[ field ].displayValue } { this.isNew( this.props.product.s19.displayValue ) }
                        </a>
                    </div>
            </div>
        );
    }

    /**
     * @name hidePopup
     * @param {Object} e Browser event object
     * @description Determines whether or not the popup should be hidden
     */
    hidePopup = e => {
        e.stopPropagation();
        if( !e.relatedTarget ) return;
        if( e.relatedTarget.classList.contains( 'popover-pst' ) ) return;
        this.props.hoverProduct({});
    }

    /**
     * @name dispatchPopup
     * @function
     * @param {Object} e Browser event object
     * @param {string} id
     * @param {string} field
     * @description
     */
    dispatchPopup( e, id, field ){

        e.stopPropagation();

        this.props.hoverProduct({
            id,
            name: this.props.product[ field ].displayValue,
            description: this.props.product.s6.displayValue,
            recommendation: this.props.product.s7.displayValue,
            generic: this.props.product[ field ].generic,
            image: this.props.product.s20.value[0]
        });
    }

    /**
     * @name renderColumn
     * @function 
     * @param {string} column The column to render
     * @returns {JSX.Element}
     * @description Renders the table data
     */
    renderColumn = column => {

        if( !this.props.showStateArray[ column.field ] ) return null;

        if( column.field === '0' ) return this.renderProduct( column.field );

        if( column.field === 's8' ) return this.renderHardware( column.field, this.props.product[ column.field ].value );
        
        let placeholder = column.defaultUOM.includes( '$' ) ? '**' : '-',
        classes = [ column.field ];

        if( this.props.parameters[ column.field ].filterType ) classes.push( this.props.parameters[ column.field ].filterType.toLowerCase() );

        return (
            <div key={ `${ this.props.product.id }-${ column.field }` } className={ classes.join( ' ' ) }>
                { this.props.product[ column.field ].displayValue || placeholder }
            </div>
        )
    }

    render(){

        if( !this.state.display || ( this.props.compareState && !this.state.selected ) ) return null;

        let classes = [ 'table-row' ];

        if( this.state.selected ) classes.push( 'blue-row' );

        return (
            <div className={ classes.join( ' ' ) } id={ this.props.product.id }>
                <div className="sticky">
                    <div className="content">
                        <input type="checkbox"
                            name={'pst'}
                            value={ this.props.product.id }
                            checked={ this.state.selected }
                            onChange={ this.selectRow }
                            ref='checkbox' />
                    </div>
                 </div>
                 { this.props.columns.map( this.renderColumn ) }
            </div>
        );

    }

}

function mapStateToProps( state ) {
    return {
        showStateArray: state.app.showStateArray,
        columns: state.app.columns,
        selectedRows: state.app.selectedRows,
        filter: state.app.filter,
        compareState: state.app.compareState,
        parameters: state.app.parameters
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ selectRow, updateAvailableFilters, hoverProduct, dtmEvent }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( Row );