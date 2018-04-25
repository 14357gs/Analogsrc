import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import ControllerTH from '../../components/ControllerTH';
import Row from '../../components/Row';
import PopOver from '../../components/PopOver';
import { addStep } from '../../actions/ActionTypes';
import { filterURL } from '../../utilities/filterURL';
import { filterRow } from '../../utilities/filters';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IE11 } from '../../constants';

import './parametricsearch.css';

class ParametricSearch extends React.Component {

    constructor( props ){
        super( props );

        this.lastScrollX = 0;
        this.lastScrollY = 0;
     
    }

    componentDidMount(){
        this.props.addStep([{
            title: 'Sort Columns',
            text: 'Click column header to sort data. Click <ctrl> key for multi-column sorting.',
            selector: 'div#columns > form > div.column:nth-child( 4 )',
            position: 'top',
            isFixed: true
        },
        {
            title: 'Reorder Columns',
            text: 'Click and hold "drag" icon in top right corner to reorder your columns.',
            selector: 'div#columns > form > div.column:nth-child( 5 )',
            position: 'top',
            isFixed: true
        },
        {
            title: 'Hide Columns',
            text: 'Quickly hide columns from table.',
            selector: 'div#columns > form > div.column:nth-child( 3 ) .hide-column',
            position: 'top',
            isFixed: true
        },
        {
            title: 'Product Details Hover',
            text: 'Access to product description, status, documentation and diagram.',
            selector: '.table-row:nth-child( 4 ) .pop-holder a',
            position: 'right',
            isFixed: true
        }]);
        this.adjustWidth();
    }

    componentDidUpdate(){
        this.adjustWidth();
    }

    /**
     * @name adjustWidth
     * @description Readjusts the widht of the body to al
     */
    adjustWidth(){
        if( !IE11 ) return;
        let headers = Number( document.querySelector( 'div#columns' ).offsetWidth ),
        table = Number( document.querySelector( 'div.table-container' ).offsetWidth ),
        container = document.querySelector( 'div.App > div[style]' ),
        newWidth = Math.max( headers, table ),
        width = `${ newWidth }px`;

        if( newWidth !== Number( container.offsetWidth ) || newWidth !== Number( document.body.offsetWidth ) ){
            document.body.minWidth = width;
            container.style.minWidth = width;
        }
    }

    componentWillReceiveProps( nextProps ){
        window.location.hash = filterURL( nextProps.filter, nextProps.parameters, nextProps.columns );
    }

    render(){

        let classes = [ 'parametric-search' ],
        availableFilters = {},
        data = [],
        columns = this.props.columns.filter( column => this.props.showStateArray[ column.field ] ),
        columnsTest = ( row, column, index ) => {
            let notInList,
            notInFilters = true,
            rowValue = row[ column.field ].value;

            if( !availableFilters[ column.field ] ) availableFilters[ column.field ] = [];

            notInList = !availableFilters[ column.field ].some( value => rowValue.indexOf( value ) > -1 ); // value not in the list = true
            if( this.props.filter[ column.field ] ) notInFilters = !this.props.filter[ column.field ].some( value => rowValue.indexOf( value ) > -1 ); // value not in the filter = true

            if( notInList || notInFilters ) availableFilters[ column.field ].push( ...rowValue );
        };
        
        // this is going to be the most memory efficient way of getting everything we want 
        for( let i = 0; i < this.props.data.length; ++i ){
            let row = this.props.data[ i ];
            if( !filterRow( this.props, row ) ) continue;
            data.push( row ); // add to data list
            columns.forEach( columnsTest.bind( this, row ) ); // figure out available filters
        };

        if( this.props.minimized ) classes.push( 'minimized' );

        if( IE11 ) classes.push( 'ie11' );
        
        return(
            <div className={ classes.join( ' ' ) }>
                <div>
                    <div id="columns" ref="head">
                        <form id="pst-form">
                            <div className="sticky column no-border">
                                <QuickLinks />
                            </div>
                            { 
                                columns.map( ( column, index ) => <ControllerTH partCount={ index === 0 ? data.length : 0 } availableFilters={ index !== 0 ? availableFilters[ column.field ] : null } key={ `controller-${ index }` } index={ index } column={ column } /> ) 
                            }
                        </form>
                    </div>
                    <div className="table-container" ref="container">
                        { data.length > 0 ? data.map( ( row, index ) => <Row product={ row } key={ `row-${ index }` } /> ) : (<p className="no-results">{ this.props.translations.noResults }</p>) }
                    </div>
                </div>
                <PopOver />
            </div>
        );
    }

}

function mapStateToProps( state ) {
    return {
        data: state.app.data,
        columns: state.app.columns,
        parameters: state.app.parameters,
        filter: state.app.filter,
        minimized: state.app.minimized,
        showStateArray: state.app.showStateArray,
        translations: state.app.translations
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ addStep }, dispatch);
}

export default connect( mapStateToProps, mapDispatchToProps )( ParametricSearch );