import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tableDownload from '../../img/HToolBar/icon-table-download.png';
import { dtmEvent } from '../../actions/ActionTypes';
import { filterRow } from '../../utilities/filters';
import { ENDPOINT_EXCEL, URL_ENV, LANG } from '../../constants';

class Excel extends React.Component {
    
    /** 
     * @name buildColumns
     * @description Builds list of headers to display on the excel sheet
     * @returns {Object} the `rows` key is a 2 dimensional array of column names and units of measure (UOM), the 
     * `raw` key is the columns being displayed in the excel file, which are used for building the data in the correct order.
     */
    buildColumns(){
        let columns = this.props.columns.filter( column => this.props.showStateArray[ column.field ] ),
        labels = columns.filter( column => column.field !== 's8' ) // don't display eval and circuit on excel)
        .map( column => {
            let name = column.external_name,
            type = this.props.parameters[ column.field ] && this.props.parameters[ column.field ].minMaxTyp ? ` (${ this.props.parameters[ column.field ].minMaxTyp })` : '';
            return name + type;
        }),
        UOM = columns.map( column => ( !column.uom || column.uom === 'n/a' ) ? '' : `(${column.uom})` );
        return { rows: [ labels, UOM ], raw: columns };
    }

    /**
     * @name buildData
     * @description Creates array form of row data
     * @param {array} data - table data
     * @param {string} field - Field to show in the array
     * @returns {array} 2 dimensional array of table data
     */
    buildData( columns, data, field ){
        return data.map( product => {
            let results = columns.map( column => {
                let item = product[ column.field ][ field ];
                return Array.isArray( item ) ? item.join( ' ' ) : item;
            });
            return results;
        });
    }

    /** 
     * @name buildFilters
     * @description Creates a human readable array of the applied filters
     * @returns {array} array of the filters, where the first item is the column name
     */
    buildFilters(){

        let rows = [];

        for( let key in this.props.filter ){
            let field = ( key[ 0 ] === 'p' ) ? key.substring( 1 ) : key,
            column = this.props.columns.find( column => column.field === field );
            if( column ) rows.push( [ column.external_name, ...this.props.filter[ key ] ] );
        }

        return rows;
    }

    /**
     * @name buildGenerics
     * @description Builds list of generic product names
     * @param {array} data 
     * @returns {array} array of generic product names
     */
    buildGenerics( data ){
        return data.map( item => item[ '0' ].generic );
    }

    /**
     * @name createRequest
     * @description Creates request object for the excel file
     */
    createRequest = e => {

        e.preventDefault();

        let now = new Date(),
        headers = this.buildColumns(),
        unformattedData = this.filterData(),
        filters = this.buildFilters(),
        data = {
            formattedDataRows: [ ...headers.rows, ...this.buildData( headers.raw, unformattedData, 'displayValue' ) ],
            rawDataRows: [ ...headers.rows, ...this.buildData( headers.raw, unformattedData, 'value' ) ],
            generics: this.buildGenerics( unformattedData ),
            baseUrl: `${ URL_ENV }/${ LANG }/`, 
            coverSheetData : { 
                nameValueData : { 
                    [ this.props.translations.excel.dateCreated ] : now.toLocaleString(), 
                    [ this.props.translations.excel.productType ] : this.props.title, 
                    [ this.props.translations.excel.webLink ] : window.location.toString() 
                }, 
                filterConditions:
                [ [ this.props.translations.excel.filter.conditions ] ]
            }, 
            messages: { 
                cover_sheet_name : this.props.translations.excel.cover, 
                web_display_sheet_name : this.props.translations.excel.display.web, 
                raw_data_sheet_name : this.props.translations.excel.display.raw
            }
        };

        if( filters.length > 0 ){
            data.coverSheetData.filterConditions[ 0 ].push( this.props.translations.excel.columnName, this.props.translations.excel.filter.values )
            data.coverSheetData.filterConditions.push( ...filters );
        } else {
            data.coverSheetData.filterConditions[ 0 ].push( `(${ this.props.translations.excel.filter.none })` )
        }

        // don't use encodeURIComponent or encodeURI. See request() for details.
        this.request( escape( JSON.stringify( data ) ) );

    }

    /**
     * @name filterData
     * @returns {array} Data visible in the table
     * @description Applies filters to the data to be exported to excel
     */
    filterData(){

        let data = this.props.data.filter( product => { return filterRow( this.props, product ); });

        if( this.props.compareState ) data = data.filter( product => this.props.selectedRows.some( row => row.id === product.id ) );

        return data;
    }

    render(){
        return (
            <button type="button" onClick={ this.createRequest }>
                { this.props.translations.button.downloadToExcel }
                <img src={ tableDownload } alt="" />
            </button>
        );
    }

    /**
     * **Caveat 1:** Data passed in needs to be escaped using `escape()`. The functions 
     * `encodeURIComponent()` and `encodeURI()` create encoded characters that the 
     * server cannot interpret once the data request is processed.
     * 
     * **Caveat 2:** Due to an issue with browsers saving binary streams from `XHR` requests,
     * in order to save the `.xlsx` file unprotected, it needs to be the response submitted
     * by an actual form. 
     * 
     * I refuse to believe there isn't a work around for this. Unfortunately, today 
     * (_27 Mar 2018_) is too close the release date (_30 Mar 2018_) to research saving the 
     * file unprotected via `XHR` requests. The answer is not immediately available in google
     * search results.
     * 
     * @name request
     * @param {string} data Stringified JSON object of data presented in the table
     * @description Sends request to the endpoint for an excel file
     */
    request( data ){

        this.props.dtmEvent( 'downloadToExcel' );

        let form = document.createElement( 'form' ),
        fileName = document.createElement( 'input' ),
        dataInput = document.createElement( 'input' );

        fileName.type = 'hidden';
        dataInput.type = 'hidden';

        form.appendChild( fileName );
        form.appendChild( dataInput );
        form.action = ENDPOINT_EXCEL;
        form.method = 'POST';

        dataInput.name = 'data';
        dataInput.value = data;
        fileName.name = 'fileName';
        fileName.value = `${ this.props.translations.excel.filename }.xlsx`;
        document.body.appendChild( form );
        form.onsubmit = e => form.remove();
        form.submit();

    }

}

function mapStateToProps( state ) {
    return {
        showStateArray: state.app.showStateArray,
        columns: state.app.columns,
        data: state.app.data,
        filter: state.app.filter,
        parameters: state.app.parameters,
        title: state.app.title,
        compareState: state.app.compareState,
        selectedRows: state.app.selectedRows,
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ dtmEvent }, dispatch );
}


export default connect( mapStateToProps, mapDispatchToProps )( Excel );