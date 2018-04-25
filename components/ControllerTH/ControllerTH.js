import React from 'react';
import Slider from './ControllerTH.Slider';
import Checkbox from './ControllerTH.Checkbox';
import Hide from './HideButton';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { sortByColumn, modifyFilter, moveColumn } from '../../actions/ActionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PartsCount from './partsCount';
import './style.css';

class ControllerTH extends React.Component {

    constructor( props ){
        super( props );

        this.state = {
            minimized: props.minimized, // determines if the filter settings should be displayed
            show: true, // determine if the column should be displayed
            modified: false, // determine if filters in column have been altered
            dragging: false, // determine if user is dragging the column header

            // sort properties for the column.
            sort: {
                isSorted: false,
                order: undefined,
                priority: 1
            }
        };

        this.debounceText = undefined; // used to debounce text input
        this.checkboxes = [];
        this.filterType = props.parameters[ props.column.field ] ? props.parameters[ props.column.field ].filterType : '';
    }

    componentDidMount(){
        this.update( this.props, true );
    }

    componentWillReceiveProps( nextProps ){
        this.update( nextProps );
    }

    /**
     * @name update
     * @param {Object} nextProps Properties being passed to the component
     * @param {boolean} init Determines if functional should handle data as if it were the initial creation of the component
     * @description Handles setup of default values for the controller
     */
    update( nextProps, init ){

        let sort = nextProps.sortPriority.find( sort => sort.column === nextProps.column.field ) || {},
        state = {
            minimized: nextProps.minimized,
            sort: {
                isSorted: ( sort.column !== undefined ),
                order: sort.order,
                priority: sort.priority
            }
        }

        // apply filter types
        if( nextProps.parameters[ nextProps.column.field ] ) this.filterType = nextProps.parameters[ nextProps.column.field ].filterType;

        // apply intial filters
        if( nextProps.filter[ nextProps.column.field ] ){
            this.markModified();
            if( this.refs.filterTextInput ) this.refs.filterTextInput.value = nextProps.filter[ nextProps.column.field ].join( '|' );
        } else {
            if( !state.sort.isSorted ) state.modified = false;
        }

        this.setState( state );
        
    }

    /**
     * @name handleChange
     * @param {Object} e Browser event object
     * @description Applies the filter value added from updating text filters (i.e. description, part number, etc.) 
     */
    handleChange = e => {

        if( this.debounceText ) clearTimeout( this.debounceText );

        this.debounceText = setTimeout( filterText => {

            this.setState({ filterText });
            this.refs.filterTextInput.value = filterText;
            this.props.modifyFilter( 'partial', this.props.filter, this.props.column.field, ( filterText !== '' ), filterText );

        }, 400,  e.target.value );
        
    }

    /** 
     * @name markModified
     * @description Marks the column as modified to alert the user that the default values have changed
    */
    markModified(){
        if( this.state.modified ) return;
        this.setState({ modified: true });
    }
    
    /** 
     * @name renderDescription
     * @description Renders a text filter for the description column
    */
    renderDescription(){
        return this.renderText( 'Filter Description' );
    }

    // renders a text filter to the page (part number)
    renderParts(){
        return (
            <div>
                <label onClick={ this.sort }>Part Number</label>
                { this.renderText( 'Filter parts' ) }
                <PartsCount count={ this.props.partCount } text={ this.props.translations.parts } />
            </div>
        );
    }

    // renders the sort indicator if the column is sorted
    renderSortIndicator( index ){

        if( !this.state.sort.isSorted ) return null;

        let classList = [ 'fa' ];

        classList.push( ( this.state.sort.order === 'asc' ) ? 'fa-caret-down' : 'fa-caret-up' );

        return (
            <div className="sort-indicator">
                <i className={ classList.join( ' ' ) } />
                { this.state.sort.priority }
            </div>
        );
    }

    /**
     * @name renderText     
     * @param {string} placeholder Placeholder text for the filter
     * @description Renders a text filter
     */
    renderText( placeholder ){
        return (
            <div>
                <input
                    className="filterText"
                    type="text"
                    name="search"
                    placeholder={ placeholder }
                    onChange={ this.handleChange }
                    ref="filterTextInput" />
            </div>
        );
    }

    // render the column header
    render(){

        if( !this.props.column ) return ( <th></th> );

        let content = null,
        classes = [ 'column' ],
        type = this.props.parameters[ this.props.column.field ] && this.props.parameters[ this.props.column.field ].minMaxTyp ? `${ this.props.parameters[ this.props.column.field ].minMaxTyp}&nbsp;|&nbsp;` : '',
        uom = this.props.column.uom,
        header = `${ this.props.column.external_name }<span>${ ( uom !=='n/a' && uom ) ? `${ type }${ uom }` : '&nbsp;' }</span>`;

        const tooltip = (
            <Tooltip id="tooltip">
                { this.props.column.tooltip }
            </Tooltip>
        );

        if( this.props.minimized ) classes.push( 'minimized' );

        if( this.filterType ) classes.push( this.filterType.toLowerCase() );

        switch( this.filterType ){

            case 'Sliders':
                content = <Slider column={ this.props.column } />;
                break;

            case 'Checkboxes':
                content = <Checkbox availableFilters={ this.props.availableFilters } column={ this.props.column } />;
                break;

            default:

                if( this.props.column.id === 'C1' ){
                    classes.push( 'sticky' );
                    content = this.renderParts();

                } else {
                    classes.push( 'text' );
                    content = this.renderText( `Filter ${ this.props.column.external_name }` );
                }
                break;
        }

        if( this.state.modified ) classes.push( 'modified' );
    
        // send the
        return (
            <div
                id={ this.props.column.field }
                className={ classes.join( ' ' ) }
                ref="container"
                onDrop={ this.reorder }>
                
                { this.renderSortIndicator() }
                { this.props.column.id !== 'C1' ?
                    <OverlayTrigger placement="top" overlay={tooltip}>
                        <div
                            className="header"
                            dangerouslySetInnerHTML={{ __html: header }}
                            onClick={ this.sort }
                            draggable={ true }                            
                            ref="header"
                            onDragOver={ e => e.preventDefault() }
                            onDrop={ this.drop }
                            onDragEnd={ this.dragEnd }
                            onDragExit={ e => this.refs.container.classList.remove( 'drop-target', 'right', 'left' ) }
                            onDragLeave={ e => this.refs.container.classList.remove( 'drop-target', 'right', 'left' ) }
                            onDragEnter={ 
                                e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if( e.dataTransfer.getData( 'dropping' ) === this.props.column.field ) return;
                                    this.refs.container.classList.add( 'drop-target', this.dragSide( e.screenX ) );

                                }
                            }
                            onDragStart={ this.dragStart }
                        /> 
                    </OverlayTrigger> : null }
                { content }
                { this.props.column.id !== 'C1' ? <Hide column={ this.props.column.field } /> : null }
            </div>
        );

    }

    /**
     * @name dragSide
     * @param {number} pos Current cursor position
     * @returns {string}
     * @description Determines which side of a column, the drop target should appear on
     */
    dragSide = pos => {
        let width = this.refs.container.offsetWidth,
        half = width / 2,
        left = this.refs.container.offsetLeft;

        return ( pos > left && pos < ( left + half ) ) ? 'left' : 'right';
    }


    /**
     * @name drop
     * @param {Object} e Browser drag event object
     * @description Reorders the columns based on what was dragged
     */
    drop = e => {

        let kill = document.querySelectorAll( '.drop-target' );

        for( let i = 0; i < kill.length; ++i ) kill[ i ].classList.remove( 'drop-target' );

        // don't waste time if the user dropped the element on itself
        if( e.dataTransfer.getData( 'dropping' ) === this.props.column.field ) return;

        this.props.moveColumn( this.props.column.field, e.dataTransfer.getData( 'dropping' ), this.dragSide( e.screenX ) );
        
    }

    /**
     * @name dragStart
     * @param {Object} e Browser drag event object
     * @description Begins the drag even and sets the data for the receiving component
     */
    dragStart = e => {
        e.dataTransfer.setData( 'dropping', this.props.column.field );
        this.refs.header.classList.add( 'dragging' );
    }

    /**
     * @name dragEnd
     * @param {Object} e Browser drag event object
     * @description handles what happens to the column being dragged after its dropped
     */
    dragEnd = e => this.refs.header.classList.remove( 'dragging' );
    
    // sorts by column on click or ctrl+click unless the user is dragging
    /**
     * @name sort
     * @param {Object} e Browser event object
     * @description Allows the user to sort the current column
     */
    sort = e => {

        e.preventDefault();

        let ctrl = e.ctrlKey;

        // this needs to occur here because the mouseUp event triggers before onClick, and therefore this.state.dragging would always be false
        if( this.state.dragging === true ) return this.setState({ dragging: false });

        this.props.sortByColumn( this.props.column.field, ( this.state.sort.order === 'asc' ) ? 'desc' : 'asc', ctrl, this.props.sortPriority );
        this.markModified();

    }

}

function mapStateToProps( state ) {
    return {
        minimized: state.app.minimized,
        parameters: state.app.parameters,
        sortPriority: state.app.sortPriority,
        filter: state.app.filter,
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ sortByColumn, modifyFilter, moveColumn }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( ControllerTH );