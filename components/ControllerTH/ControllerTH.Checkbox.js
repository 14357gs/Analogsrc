import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { modifyFilter } from '../../actions/ActionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import './style.css';

class CheckboxTH extends React.Component {

    constructor( props ){
        super( props );

        this.state = {
            selectedCheckboxes: this.determineCount( props.filter[ props.column.field ], props.column.values.length )
        };
    }

    componentWillReceiveProps( nextProps ){
        this.setState({ selectedCheckboxes: this.determineCount( nextProps.filter[ nextProps.column.field ], nextProps.column.values.length ) });
    }

    /**
     * @name determineCount
     * @function
     * @param {array} [filters] Array of selected values
     * @param {number} [total] Total number of available values
     * @description Updates the component with the correct number of selected values
     */
    determineCount( filters, total ){
        if( this.checkboxes && this.checkboxes.filter( elem => elem.checked ).length > 0 ) return this.checkboxes.filter( elem => elem.checked ).length;
        let count = ( filters ) ? filters.length : total + 1; // add an extra for the "blank" checkbox
        return count; 
    }

    /**
     * @name checkAll
     * @description Selects all checkboxes and applies their filter
     */
    checkAll = () => {
        let selected = this.refs[ 'select-all' ].checked,
        values = [];

        this.checkboxes.forEach( elem => {
            elem.checked = selected;
            if( selected ) values.push( elem.value );
        });

        this.props.modifyFilter( 'exclude', this.props.filter, this.props.column.field, true, values );

        if( this.refs.selectedCount ) this.refs.selectedCount.innerHTML = this.checkboxes.filter( elem => elem.checked ).length;
    }

    /**
     * @name handleChange
     * @param {Object} e Browser event object
     */
    handleChange = e => {
        this.refs[ 'select-all' ].checked = !this.checkboxes.some( elem => !elem.checked );                                    
        this.props.modifyFilter( 'exclude', this.props.filter, this.props.column.field, true, this.checkboxes.filter( elem => elem.checked ).map( elem => elem.value ) );
    }

    render(){

        if( !this.props.column.values ) return null;

        this.checkboxes = [];

        let textSearch = '',
        list = this.props.filter[ this.props.column.field ],
        disableBlankField   = ( this.props.availableFilters ) ? !this.props.availableFilters.some( value => value === String( '' ) ) : true,
        checkedBlankField   = list ? list.some( value => '' === String( value ) ) : true;

        if( this.props.minimized ){
            textSearch = (
                <div key={ `${ this.props.column.field }-selected-checkbox` } className="details">
                    <span key={ `${ this.props.column.field }-selected-checkbox-count` } ref="selectedCount">{ this.state.selectedCheckboxes }</span>&nbsp;
                    <span>{ `${ this.props.translations.valuesSelected }` }</span>
                    &nbsp;
                    <Glyphicon glyph="chevron-down" />
                </div> 
            );
        }

        return (
            <div>
                { textSearch }
                <div className="overflow-checkboxes">                    
                    <label htmlFor={  `${ this.props.column.field }-checkbox-select-all` } key={ `${ this.props.column.field }-checkbox-select-all` }>
                        <input type='checkbox' id={ `${ this.props.column.field }-checkbox-select-all` } ref="select-all" defaultChecked={ ( !list ) } onChange={ this.checkAll } />
                        &nbsp;{ this.props.translations.button.selectAll }
                    </label>
                    <hr/>
                    <label htmlFor={  `${ this.props.column.field }-checkbox-filter-blank` } className={ `${ disableBlankField && checkedBlankField ? 'disabled' : ''} form-check-label` } key={ `${ this.props.column.field }-label-blank` }>
                        <input type="checkbox"
                            id={ `${ this.props.column.field }-checkbox-filter-blank` }
                            value=""
                            disabled={ disableBlankField && checkedBlankField }
                            name={ this.props.column.field }
                            key={`${ this.props.column.field }-checkbox-blank`}
                            defaultChecked={ checkedBlankField }
                            ref={ 
                                elem => {
                                    if( !elem ) return;
                                    elem.checked = checkedBlankField;
                                    this.checkboxes.push( elem ) 
                                }
                            }
                            onChange={ this.handleChange } />
                        &nbsp;Blanks
                    </label>
                    <hr />
                    {  

                        this.props.column.values.map( ( val, v ) => {

                            let checked = list ? list.some( value => String( val ) === String( value ) ) : true,
                            disabled = ( this.props.availableFilters ) ? !this.props.availableFilters.some( value => value === String( val ) ) : true,
                            classes = [ 'form-check-label' ];
                            
                            if( disabled && checked ) classes.push( 'disabled' );

                            return (
                                <label className={ classes.join( ' ' ) } key={ `${ this.props.column.field }-label-${ v }` }>
                                    <input type="checkbox"
                                        id={v}
                                        value={val}
                                        name={ this.props.column.field }
                                        disabled={ disabled && checked }
                                        key={ `${ this.props.column.field }-checkbox-${ v }` }
                                        ref={ 
                                            elem => {
                                                if( !elem ) return; 
                                                elem.checked = checked;
                                                this.checkboxes.push( elem );
                                            }
                                        }
                                        onChange={ this.handleChange } />
                                    &nbsp;{val}
                                </label>
                            )
                        }) 
                    }                    
                </div>
            </div>
        );

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
    return bindActionCreators({ modifyFilter }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( CheckboxTH );