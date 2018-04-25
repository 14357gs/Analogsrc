import { sortNewest } from '../utilities/sorts';
import { TRANSLATIONS } from '../constants';

/** 
 * Changes to this object should be few and far between. Edit with extreme caution.
 * @constant 
 * @name INITIAL_STATE
 * @type {Object}
 * @default
 * @description This is the object that maintains all of the values that are curried between all of the components
 * @property {array} data This is the data for the rows that appear in the table.
 * @property {array} columns Array of columns available to be displayed in the table
 * @property {array} parameters details about the information meant to be display in each column, as well as their filter types
 * @property {Object} showStateArray Not actually an array, but too involved to change the name. These is the columns that are actually being displayed in the table
 * @property {Object} filter Object containing filters that are applied to the table. 
 * @property {boolean} minimized Determines if the column headers are minimized or not
 * @property {string} minimizedTitle Label for the minimized button
 * @property {boolean} spinner Activity indicator for the app. When set to true, the spinner appears and hides the rest of the table.
 * @property {boolean} networkError Denotes if an error has taken place during the initial data request
 * @property {boolean} showModal Determines if the parameters modal is visible or not
 * @property {array} sortPriority Contains the sort priority of the columns where index 0 is the highest prority
 * @property {boolean} compareState Determines if only the selected parts should be displayed
 * @property {string} language The language the app should be displayed in
 * @property {Object} error Contains request errors (in tandem with networkError)
 * @property {array} selectedRows Array containing the IDs of the selected rows
 * @property {Object} availableFilters The remaining data that's available in the table. The keys of this object are the columns' fields
 * @property {Object} hoverProduct Pertinent information regarding to the current product the user's mouse is over
 * @property {Object} quickSearch 
 * @property {Boolean} quickSearch.hasQuickFilter
 * @property {Object} translations
*/
const INITIAL_STATE = {
    originalData: [],
    data: [],
    columns: [],
    parameters: [],
    showStateArray: {},
    filter: {},
    minimized: true,
    minimizedTitle: 'Minimize',
	spinner: true,
	networkError: false,
	showModal: false,
  	sortPriority: [],
	compareState: false,
    language: 'en',
    error: {},
    selectedRows: [],
    availableFilters: {},
    hoverProduct: {},
    quickSearch: {
        hasQuickFilter: false
    },
    translations: TRANSLATIONS,
    walkthrough: []
};

const AppReducer = (state = INITIAL_STATE, action) => {
    
	switch (action.type){

        case 'WALKTHROUGH_STEP':
            let walkthrough = [ ...state.walkthrough ];
            walkthrough.push( ...action.payload.steps );
            return { ...state, walkthrough };

        case 'RESET':
            let resetData = sortNewest( state.data ),
            resetColumns = [ ...state.originalColumns ],
            resetShow = { ...state.originalShowStateArray };
            return { ...state, data: resetData, columns: resetColumns, filter: {}, sortPriority: [], selectedRows: [], showStateArray: resetShow, compareState: false, spinner: false };

        case 'INITIAL_LOAD':
            return { ...state, spinner: false, ...action.payload };

        case 'COLUMN_TOGGLE':
            let newStateAray = { ...state.showStateArray },
            newFilter = { ...state.filter };
            newStateAray[ action.payload.column ] = !newStateAray[ action.payload.column ];
            newFilter.d = []
            for( let key in newStateAray ){
                if( newStateAray[ key ] ) newFilter.d.push( key );
            }

            return { ...state, showStateArray: newStateAray, filter: newFilter };

        case 'HOVER_PRODUCT':
            return { ...state, hoverProduct: action.payload.product };
        case 'PART_COUNT':
            return { ...state, partCount: action.payload.count };
        case 'AVAILABLE_FILTERS':

            let availableFilters = Object.assign({}, state.availableFilters ),
            notInList,
            notInFilters = true;

            if( !availableFilters[ action.payload.column ] ) availableFilters[ action.payload.column ] = [];

            notInList = !availableFilters[ action.payload.column ].some( value => value === action.payload.value ); // value not in the list = true
            if( state.filter[ action.payload.column ] ) notInFilters = !state.filter[ action.payload.column ].some( value => value === action.payload.value ); // value not in the filter = true

            if( notInList || notInFilters ) availableFilters[ action.payload.column ].push( action.payload.value );

            return { ...state, availableFilters };
        case 'LOG_ERROR':
            return { ...state, spinner: false, networkError: true, error: action.payload.err };
        case 'SELECT_ROWS':
			return { ...state, selectedRows: action.payload.rows };
        case 'TABLE_DATA':
            return { ...state, data: action.payload.data };

        case 'TABLE_SORT':
            let newData = action.payload.sortFunction( Object.assign([], state.data ), action.payload.sortPriority, state.parameters );
            return { ...state, data: newData };
        
        case 'TABLE_FILTER':

            let newVisible = { ...state.showStateArray };

            for( let key in action.payload.filter ) newVisible[ key ] = true;

            return { ...state, filter: action.payload.filter, showStateArray: newVisible, availableFilters: {} };
        case 'COLUMN_ORDER':

            let oldColumns = [ ...state.columns ],
            index = oldColumns.findIndex( column => column.field === action.payload.field ),
            columns = Object.assign([], oldColumns ),
            column = columns.splice( index, 1 )[ 0 ],
            firstColumn = columns.splice( 0, 1 )[ 0 ];
        
            columns.unshift( firstColumn, column );

            return { ...state, columns };
    	case 'COLUMN_DATA':
            return { ...state, columns: action.payload.columns, title: action.payload.title };
        case 'COLUMN_MOVE':

            let reorderedColumns = [ ...state.columns ],
            moveIndex = reorderedColumns.findIndex( column => column.field === action.payload.movingColumn ),
            movingColumn = reorderedColumns.splice( moveIndex, 1 )[ 0 ],
            afterIndex = reorderedColumns.findIndex( column => column.field === action.payload.relativeColumn );
            
            reorderedColumns.splice( action.payload.side === 'left' ? afterIndex : ( afterIndex + 1 ), 0, movingColumn );

            return { ...state, columns: reorderedColumns };

        case 'DISPLAY_DEFAULT_VIEW':
        
            let newStateArray = { ...state.showStateArray },
            oldColumnOrder = [ ...state.columns ],
            newColumnOrder = [ oldColumnOrder.shift() ];
            if( action.payload.columns ) action.payload.columns.forEach( column => newStateArray[ column.field ] = column.display );

            for( let field in newStateArray ){
                if( !action.payload.columns ) newStateArray[ field ] = true;
                let index = oldColumnOrder.findIndex( column => column.field === field );

                /* 
                    if it doesn't exist in the original columns list, it will break things if it gets added
                    Likewise, we want to keep the original columns displayed in their original order.
                */
                if( index === -1 ) continue; 
                if( oldColumnOrder[ index ][ 'display_in_default_view' ] === 'true' ) continue; 

                newColumnOrder.push( oldColumnOrder.splice( index, 1 )[ 0 ] );
            }

            // add remaining values that weren't altered
            newColumnOrder.push( ...oldColumnOrder );

            return { ...state, showStateArray: newStateArray, columns: newColumnOrder }
            
    	case 'PARAMETER_DATA':
      		return { ...state, parameters: action.payload.parameters };
    	case 'ORIGINAL_TABLE':
      		return { ...state, originalData: action.payload.originalData };
    	case 'MINIMIZE_CONTROLS':
      		return { ...state, minimized: action.payload.minimized, minimizedTitle: action.payload.title };
    	case 'SORT_BY_COLUMN':
			return { ...state, order: action.payload.order, sortPriority: action.payload.sortPriority };
		case 'SHOW_SPINNER':
			return { ...state, spinner: action.payload };
		case 'HANDLE_MODAL':
			return { ...state, showModal: action.payload.showModal };
		case 'HIDE_COLUMN':
			return { ...state, hideColumn: action.payload.hideColumn, columnIndex: action.payload.columnIndex };
        case 'COMPARE_TOGGLE':
        
            let filter = { ...state.filter }; 

            if( action.payload.compareState ){
                filter.sel = state.selectedRows.filter( row => row.selected ).map( row => row.id );
            } else {
                delete filter.sel;
            };

			return { ...state, compareState: action.payload.compareState, filter };
		default:
			return state;
	}
}

export default AppReducer;
