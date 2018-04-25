/**
 * @name filterColumn
 * @function
 * @param {Object} parameters - Object containing information determining how the filters should be evaluated
 * @param {Object} product - The product being evaluated
 * @param {string} column - The column name to be filtered against
 * @param {array} filters - Array of values that should be met in the corresponding product column 
 * @description Determines if the column of a row meets the criteon to be displayed
 * @returns {boolean} 
 */
export const filterColumn = ( parameters, product, column, filters ) => {

    if( !product[ column ] ) return true; // if the filter key doesn't exist against the product, ignore it

    if( !filters ) return true;

    let newFilters = [ ...filters ]; // DON'T MODIFY THE FILTER DIRECTLY!!!!!

    if( newFilters.indexOf( 'blank' ) !== -1) newFilters[ newFilters.indexOf( 'blank' ) ] = '';

    if( parameters[ column ] ){
        switch( parameters[ column ].filterType.toLowerCase() ){

            case 'checkboxes':
                return product[ column ].value.some( value => {
                    
                    return newFilters.some( filter => {                        

                        // if no wild card, handle the value literally
                        if( filter.indexOf( '*' ) === -1 ) return ( value === filter );
                        
                        // handle wildcard values
                        let term = filter.replace( /\*/g, '(.*?)' ),
                        reg = new RegExp( term, 'i' );
                        return reg.test( value );

                    });

                });

            // slider filter
            case 'sliders':

                // handle quick word associations
                if( newFilters[ 0 ] === 'min' ) newFilters[ 0 ] = parameters[ column ].min;
                if( newFilters[ 1 ] === 'max' ) newFilters[ 1 ] = parameters[ column ].max;

                let min = Math.min( ...newFilters ),
                max = Math.max( ...newFilters ),
                values = [ ...product[ column ].value ].map( value => parseFloat( value ) );

                return values.some( value => {
                    if( isNaN( value ) || value === '' ) return ( parameters[ column ].matchNull );
                    return ( value >= min && value <= max );
                });

            default:
                return newFilters.some( filter => {
                    let filterReg = new RegExp( filter, 'gi' );
                    return product[ column ].value.some( val => filterReg.test( val ) );
                });
        }
    } else {
        return newFilters.some( filter => {
            let filterReg = new RegExp( filter, 'gi' );
            return product[ column ].value.some( val => filterReg.test( val ) );
        }); 
    }

}

/**
 * @name filterRow
 * @function
 * @param {Object} [product] - the product to be filtered against. Used in array filter scenario.
 * @param {object} [filter] - the object containing the filters
 * @param {Object} props - the props bound to the component utilizing the filter
 * @param {Object} props.parameters - the object containing the filters
 * @param {Object} [props.filter] - the object containing the filters
 * @param {Object} [props.product] - the product to be filtered against. Used in component filter scenario.
 * @description Applies the filter to the product listing. Meant to be used in .filter() method
 * @return {boolean} determinination of if the product should be included
 */
export const filterRow = ( props, product, filter ) => {

    let display = true;

    for( let key in props.filter ){
        if( !display ) break;
        if( key === 'd' || key === 'ca' || key === 'qsfv' || key === 'sel' ) continue;
        display = filterColumn( props.parameters, product || props.product, ( key[ 0 ] === 'p' ) ? key.substring( 1 ) : key, ( filter ) ? filter[ key ] : props.filter[ key ],  );
    }

    return display;

}