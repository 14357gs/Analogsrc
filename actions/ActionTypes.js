import axios from 'axios';
import * as Constants from '../constants';
import { buildFilter, filterURL } from '../utilities/filterURL';
import { sortNewest, sortColumn } from '../utilities/sorts';

/**
 * @name dtmEvent
 * @param {string} name The name of the direct call event to execute
 * @param {Object} variableDefinitions Additional variable information required by the event (hash and PST Id are included by default)
 * @description Dispatches a direct call event to Adobe DTM
 */
export const dtmEvent = ( name, variableDefinitions ) => {
    return {
        type: name,
        meta: {
            report: { 
                type: name,
                payload: variableDefinitions
            }
        }
    };
};

/**
 * @name addStep
 * @param {Object|array} step Step to add to the walkthrough
 * @description Adds steps to the walkthrough array.
 */
export const addStep = steps => {
    return dispatch => dispatch({ type: 'WALKTHROUGH_STEP', payload: { steps: Array.isArray(steps) ? steps : [ steps ] } });
}

/**
 * @name hoverProduct
 * @function
 * @param {Object} product Product information to display
 * @param {string} product.id Element Id to bind the popup to
 * @param {string} product.name Name of the product
 * @param {string} product.description Description of the product
 * @param {string} [product.recommendation] Recommendation type of the product (if any)
 * @param {string} product.datasheet URL to the data sheet of the product
 * @param {string} product.generic Generic name for the product
 * @param {string} product.image Image to display in the popup
 * @description Displays the appropriate part during hover over the related product cell
 */
export const hoverProduct = product => {
    return dispatch => dispatch({ type: 'HOVER_PRODUCT', payload: { product } });
}

/**
 * @name updatePartCount
 * @function
 * @param {number} count - column the value is available to
 * @description Updates the number of displayed parts
 */
export const updatePartCount = count => {
    return dispatch => dispatch({ type: 'PART_COUNT', payload: { count } });
}

/**
 * @name updateAvailableFilters
 * @deprecated
 * @function
 * @param {Object} filters - column the value is available to
 * @description Updates the values that are available. dupes and filtered values are removed in appReducer.js
 */
export const updateAvailableFilters = filters => {
    return dispatch => dispatch({ type: 'AVAILABLE_FILTERS', payload: { filters } });
}

/**
 * @name consumeFilter
 * @function
 * @param {Object} filter Object containing the filters for the table
 * @description Transposes the filter object created by the URL. Used exclusively by the QuickSearch component.
 */
export const consumeFilter = filter => {
    return dispatch => dispatch({ type: 'TABLE_FILTER', payload: { filter } });
}

/**
 * @name modifyFilter
 * @function
 * @param {string} type - type of filter, partial or *. partial is handled assuming the value is a string, everything else is handled as an array.
 * @param {Object} filters - object containing the existing filters, whose keys are the column name
 * @param {string} column - the name of the column the filter should be applied to 
 * @param {boolean} add - determines whether to add or remove a text filter
 * @param {array|string} value - the value(s) the provided column should be filtered by
 * @description Modifies the filter that's applied to the table data
 */
export const modifyFilter = ( type, filters, column, add, value ) => {

    let newFilter = Object.assign({}, filters );

    // create filter array if one doesn't exist
    if( !newFilter[ column ] ) newFilter[ column ] = [];

    switch( type ){
        case 'partial':            
            ( add ) ? newFilter[ column ] = value.toLowerCase().split( '|' ) : delete newFilter[ column ];
            break;

        default:
            newFilter[ column ] = value;
            break;
    }

    return dispatch => {
        dispatch({ type: "TABLE_FILTER", payload:{ filter: newFilter, clear: true }});
        
    }
}

/** 
 * @name clearFilter
 * @deprecated
 * @function
 * @description Clears all existing filters on the table.
*/
export const clearFilter = () => {
    return dispatch => dispatch({ type: "TABLE_FILTER", payload:{ filter: {} }});
}

/**
 * @name minimizeControls
 * @function 
 * @param {boolean} state - the current state of whether the header is minimized (opposite of the state want to express)
 * @example minimizeControls( false ) would minimize the controls
 * @description Sets the status of whether the header controls are minimized or maximized
 */
export const minimizeControls = state => {
    return dispatch => dispatch({ type: "MINIMIZE_CONTROLS", payload: { minimized: !state, title: !state ? "Maximize" : "Minimize" } });
}

/**
 * @name sortByNewest
 * @function 
 * @param {array} data - data to be sorted
 * @param {boolean} ignoreDispatch - determines if the sorted data should be returned or sent through dispatch
 * @description sorts data by newest creation date. Only sorts descending, running multiple times will not change the sort order.
 */
export const sortByNewest = data => {
    
    //let sortedData = [ ...data ].sort( sortNewest );

    return dispatch => {
        //dispatch({ type:'TABLE_DATA', payload: { data: sortedData } });
        dispatch({ type:'TABLE_SORT', payload: { sortFunction: sortNewest } });
        dispatch({ type:'SORT_BY_COLUMN', payload: { sortPriority: [] } });
    }
}

/** 
 * @name clearSorts
 * @deprecated
 * @function
 * @description Clears all existing sorting on the table.
*/
export const clearSorts = () => {
    return dispatch => dispatch({ type: "SORT_BY_COLUMN", payload:{ sortPriority: [] }});
}

/**
 * @name sortByColumn
 * @function
 * @param {array} data - data to be sorted
 * @param {string} column - column to be sorted by
 * @param {string} order - direction the column should be sorted by. "asc" for ascending or "desc" for descending
 * @param {boolean} addToCurrentSort - determines if provided sort should be added to (true) or replace the existing sort (false)
 * @param {array} currentPriority - the current sort criterion
 * @description Allows user to sort the provided data by the provided column
 */
export const sortByColumn = ( column, order, addToCurrentSort, currentPriority ) => {

    let priority = currentPriority.length + 1,
    exists = currentPriority.find( sort => sort.column === column ),
    sortPriority = !addToCurrentSort ? [{ column, order, priority: 1 }] : currentPriority;

    // if column isn't already in the sort priority
    if( !exists ){
        currentPriority.push({ column, order, priority });

    // otherwise, update the order
    } else {
        exists.order = order;
    }

    return dispatch => {
        dispatch({ type:'SORT_BY_COLUMN', payload: { sortPriority } }); // broadcast sort priotities
        dispatch({ type:'TABLE_SORT', payload: { sortFunction: sortColumn, column, sortPriority } });
    };

}

/**
 * @name toggleColumn
 * @function 
 * @param {string} column - name of the column to show/hide
 * @description Toggles the visibility of the provided column
 */
export const toggleColumn = column => {
    return dispatch => dispatch({ type: "COLUMN_TOGGLE", payload: { column } });
}

/**
 * @name displayColumns
 * @function
 * @param {Object[]} [columns] - array of available columns and their visibility state
 * @param {string} column[].field - column to set the visiblity state of
 * @param {boolean} column[].display - visiblity state of the cooresponding column
 * @description Sets visibility of columns in bulk. When no columns are provided, all columns are displayed by default.
 */
export const displayColumns = columns => {
    return dispatch => dispatch({ type: "DISPLAY_DEFAULT_VIEW", payload: { columns }});
}

/**
 * @name sendColumnToFront
 * @function
 * @param {string} field - name of the column to move to the front
 * @description Moves the provided column (field) directly after the first column (product name)
 */
export const sendColumnToFront = field => {
    return dispatch => dispatch({ type: "COLUMN_ORDER", payload: { field } });
}

/**
 * @name moveColumn
 * @function
 * @param {string} relativeColumn - The column the moving column will appear next to
 * @param {string} movingColumn - The column to be moved
 * @param {string} side Side of the relative column to move the moving column to
 * @description Moves a column to the side of another. Dispatched at the end of a drag
 */
export const moveColumn = ( relativeColumn, movingColumn, side ) => {
    return dispatch => dispatch({ type: 'COLUMN_MOVE', payload: { relativeColumn, movingColumn, side } });
}

/**
 * @name handleModal
 * @function
 * @param {boolean} state - visibility state of the modal
 * @description Toggles the state of visibility for the parameters modal.
 */
export const handleModal = state => {
    return dispatch => dispatch({ type: "HANDLE_MODAL", payload: { showModal: !state }});
}

/**
 * @name selectRow
 * @function
 * @param {string} id - ID of the row to (de)select
 * @param {boolean} selected - state of selection. true = selected, false = deselected
 * @param {array} oldRows - array of rows available to (de)select
 * @description Selects a row in the table
 */
export const selectRow = ( id, selected, oldRows ) => {
    
    let rows = Object.assign([], oldRows ),
    currentRow = rows.find( row => row.id === id );

    if( !currentRow ){
        rows.push({ id, selected });
    } else {
        currentRow.selected = selected; // this updates the rows variable through inheritence, don't be dumb and delete it
    }

    return dispatch => dispatch({ type: "SELECT_ROWS", payload: { rows } } );
}

/**
 * @name handleCompare
 * @function
 * @param {boolean} state - table's compare mode state. true = comparing, false = normal
 * @description Toggles compare state of the table (only displays selected parts)
 */
export const handleCompare = state => {
    return dispatch => dispatch({ type: "COMPARE_TOGGLE", payload: { compareState: !state }});
}

/**
 * @name showSpinner
 * @function
 * @param {boolean} [state]  
 * @description Displays spinner. If passed a value, sets the spinner visibility to whatever the passed value is.
 */
export const showSpinner = state => {
    return dispatch => dispatch({ type: 'SHOW_SPINNER', payload: ( state !== undefined ) ? state : true });
}

/** 
 * @name reset
 * @function
 * @description Resets the table to the initial load state
*/
export const reset = () => { 
    return dispatch => dispatch({ type: 'RESET' });
}

/** 
 * @name fetchData
 * @function
 * @description Retrieves the table data from the end points
*/
export const fetchData = () => {
    return dispatch => {

        axios
            .all([ getParametersData(), getHeaderData(), getQuickSearch() ])
            .then(
                axios
                    .spread( ( param, columns, quickSearch ) =>{
                    
                        let filter = buildFilter( columns.data.queryStrings, param.data ),
                        showStateArray = {},
                        selectedRows = filter.sel ? filter.sel.map( id => { return { id, selected: true } } ) : [],
                        compareState = ( selectedRows.length > 0 );

                        // apply default filters 
                        if( Object.keys( columns.data.queryStrings ).length > 0 ) window.location.hash = filterURL( filter, param.data, columns.data.columns );

                        //default display values
                        columns.data.columns.forEach( col => {
                            
                            // always show part number, no matter what
                            if( col.field === '0' ) return showStateArray[ col.field ] = true;

                            // if "d" params exist from the URL, use those
                            if( filter.d ) return showStateArray[ col.field ] = ( filter.d.indexOf( col.field ) > -1 );

                            if( filter[ col.field ] ) return showStateArray[ col.field ] = true;

                            // use default values
                            showStateArray[ col.field ] = ( col.display_in_default_view === "true" );

                            // fields meant to be displayed in addition to default values
                            if( filter.ca ){
                                if( filter.ca.indexOf( col.field ) > -1 ) showStateArray[ col.field ] = true;
                            }

                        });

                        axios
                            .get( `${ Constants.ENDPOINT_DATA + columns.data.categoryId }.js`, { validateStatus } )
                            .then( tableData => {

                                let data = sortNewest( tableData.data.data );

                                dispatch({
                                    type: 'INITIAL_LOAD',
                                    payload: {
                                        parameters: param.data,
                                        columns: columns.data.columns, 
                                        title: columns.data.title,
                                        showStateArray,
                                        data,
                                        originalData: data,
                                        originalColumns: columns.data.columns,
                                        originalShowStateArray: showStateArray,
                                        filter,
                                        quickSearch: quickSearch.data,
                                        selectedRows,
                                        compareState
                                    }
                                });

                            })
                            .catch( error );

                    })
            )
            .catch( error );
            
        /**
         * @name validateStatus
         * @function
         * @private
         * @param {number} status 
         * @description Ensures only actual errors are rejected by Axios. By
         * default, Axios treats all non-200 status codes as errors.
         * 
         * For more details, see: https://github.com/axios/axios#handling-errors
         */
        function validateStatus( status ){
            return status < 400; 
        }

        /**
         * @name error
         * @function 
         * @private
         * @param {Object} err 
         * @description Handles errors the occurred during the data requests
         */
        function error( err ){

            console.error( err );

            if( !err.response && err.message === 'Network Error' ){
                err = {
                    response: {
                        status: 403,
                        statusText: 'Cross-Origin Request Blocked'
                    },
                    message: 'The Same Origin Policy disallows reading the remote resource.'
                };
            }
            
            dispatch({ type: "LOG_ERROR", payload: { err } });
        }

        /** 
         * @name getQuickSearch
         * @function
         * @private
         * @description Retrieves the HTML for the "Quick ${Table} Search"
        */
        function getQuickSearch(){
            return axios.get( Constants.ENDPOINT_QUICK_SEARCH, { validateStatus } );
        }

        /**
         * @name getParametersData
         * @function
         * @private
         * @description Retrieves the parameters data for the column headers for the table
         */    
        function getParametersData() {
            return axios.get( Constants.ENDPOINT_PARAMETERS, { validateStatus } );
        }
        /**
         * @name getHeaderData
         * @function
         * @private
         * @description Retrieves the column header and default filter information for the table
         */
        function getHeaderData() {
            return axios.get( Constants.ENDPOINT_HEADER, { validateStatus } );
        }
        
    }
}   