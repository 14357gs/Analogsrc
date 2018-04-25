/**
 * `s19` = is new
 * `s18` = publish date
 * @name sortNewest
 * @function
 * @param {array} data - data to be sorted
 * @description sorts provided data by newest creation date
 */
export const sortNewest = data => data.sort(
    ( a, b ) => {

        let d1 = Number( a.s1.displayValue ),
        d2 = Number( b.s1.displayValue );

        if( a.s19.displayValue.toLowerCase() !== 'no' && b.s19.displayValue.toLowerCase() === 'no' ) return -1;
        if( a.s19.displayValue.toLowerCase() === 'no' && b.s19.displayValue.toLowerCase() !== 'no' ) return 1;
        if( d1 < d2 ) return 1;
        if( d1 > d2 ) return -1;
        return 0;
    }
);

/**
 * @name sortColumn
 * @function
 * @param {array} data - data to be sorted
 * @param {array} sortPriority - priority order of the sort
 * @param {string} parameters - column to sort by
 * @description sort provided data by the provided column and sort priority
 */
export const sortColumn = ( data, sortPriority, parameters ) => {

    let sortedData = [ ...data ],
    newPriority = [...sortPriority].reverse(),
    map = value => !isNaN( value ) ? Number( value ) : value;

    // go through each sort and assign weight to the current row
    newPriority.forEach( sort => {

        sortedData = sortedData.sort( ( a, b ) => {
    
            let val1 = a[ sort.column ].value.map( map ),
            val2 = b[ sort.column ].value.map( map ),
            type = parameters[ sort.column ] ? parameters[ sort.column ].type.toLowerCase() : 'string';

            switch( type ){

                // numbers
                case 'integer':
                case 'floating point':
                case 'range':
                case 'number':
                    val1 = Math.max( ...val1 );
                    val2 = Math.max( ...val2 );
                    break;

                // multiple options, potentially strings
                case 'pulldown':

                    let weight = 0,
                    incPos = ( sort.order === 'asc' ) ? 1 : -1,
                    incNeg = ( sort.order === 'asc' ) ? -1 : 1,
                    largerArray = val1.length > val2.length ? val1 : val2;

                    largerArray.forEach( ( value, index ) => {
                        if( !val1[ index ] || val1[ index ] === '' ) return weight += 1;
                        if( !val2[ index ] || val2[ index ] === '' ) return weight += -1;
                        if( val1 < val2 ) return weight += incNeg;
                        if( val1 > val2 ) return weight += incPos;
                        return weight += 0;
                    });

                    return weight;

                case 'string':
                default:
                    val1 = val1.join( ',' );
                    val2 = val2.join( ',' );        
                    break;

            }

            if( sort.order === 'asc' ){                
                if( val1 < val2 ) return -1;
                if( val1 > val2 ) return 1;
            } else {
                if( val1 > val2 ) return -1;
                if( val1 < val2 ) return 1;
            }

            return 0;
        });
        
    });

    return sortedData;
    
};