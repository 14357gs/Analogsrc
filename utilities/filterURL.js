/**
    @name filterURL
    @function
    @param {Object} filters object containing the existing filters, whose keys are the column name
    @param {Object} parameters parameters available for the current table
    @param {array} columns Necessary for checkboxes only. Array of the total possible values, used to determine select all/none matrix
    @returns {string} The Hash the URL should be updated with
    @description This function converts the filter for the table into the hash for the URL
*/
export const filterURL = ( filters, parameters, columns ) => {

    let qs = [],
    url = '#/';

    for( let field in filters ){

        if( parameters[ field ] ){

            switch( parameters[ field ].filterType.toLowerCase() ){

                // determine select all/none
                case 'checkboxes':

                    let column = columns.find( column => column.field === field ),
                    values = column ? column.values : undefined;

                    if( !values ) break;

                    if( filters[ field ].length === ( values.length + 1 ) ){ // +1 because of the new blank filter
                        qs.push( `p${ field }=select%20all` );
                        break;
                    } else if( filters[ field ].length === 0 ){
                        qs.push( `p${ field }=select%20none` );
                        break;
                    }
                
                    // do not put a break here, we want this fall-through

                // specific checkboxes & slider values
                default:
                    qs.push( `p${ field }=${ filters[ field ].map( value => encodeURI( value ) ).join( '|' ) }` );
                    break;
                
            }

        } else {
            
            // column display
            if( field === 'd' ){
                qs.push( `${ field }=sel|${ filters[ field ].join( '|' ) }` );
                continue;
            }

            // additional column display 
            if( field === 'ca' || field === 'sel' ){
                qs.push( `${ field }=${ filters[ field ].join( '|' ) }` );
                continue;
            }

            // quick search form values
            if( field === 'qsfv' ) continue;

            qs.push( `p${ field }=${ filters[ field ].map( value => encodeURI( value ) ).join( '|' ) }` );
        }
    } 

    if( qs.length === 0 ) return url;

    return `${ qs.join( '&' ) }`;
};

/**
 * @name buildFilter
 * @function
 * @param {Object} [queryString] pre-defined query string object, may not be there
 * @param {array} queryString.column[] The column to be filtered (Not actually the word "column", will be something like "2606")
 * @param {array} queryString.column[].value The value to be added to the filter by default
 * @param {array} queryString.column[].similarity Determines the position of the value in the filter. (`9` represents `===`, `7` represents `>`, `6` represents `<` )
 * @param {Object} [parameters] Currently unused. This is only here to prepare for it's implementation
 * @returns {Object} Filter object
 * @description This function converts the hash from the URL and quick filters into a filter for the table
 */
export const buildFilter = ( queryString, parameters ) => {

    let qsParams = window.location.hash.substring( window.location.hash[ 1 ] === '/' ? 2 : 1 ).split( '&' ),
    filters = {};

    if( queryString ){

        for( let key in queryString ){

            let min = queryString[ key ].find( param => param.similarity === 7 ),
            max = queryString[ key ].find( param => param.similarity === 6 );

            /**
             * For checkboxes only! Will most likely break if used elsewhere.
             * @name testMinMax
             * @function
             * @private
             * @param {string|number} value To be compared against the min or max
             * @returns {boolean}
             * @description Determines if the values meet the requirements for the min/max default params
             */
            const testMinMax = value => {

                let passMin = true,
                passMax = true;

                if( min ) passMin = Number( value ) > Number( min.value );
                if( max ) passMax = Number( value ) < Number( max.value );

                return ( passMin && passMax );
                
            };

            if( !parameters[ key ] ){
                filters[ key ] = queryString[ key ].sort().map( param => param.value );
                continue;
            }

            switch( parameters[ key ].filterType.toLowerCase() ){
                
                case 'checkboxes':

                    filters[ key ] = queryString[ key ].sort().map( param => param.value );                    

                    if( min || max ) filters[ key ] = [ ...filters[ key ], ...parameters[ key ].values.filter( testMinMax ).sort().map( value => value.toString() ) ];

                    break;

                case 'sliders':
                    filters[ key ] = [ min ? min.value : 'min', max ? max.value : 'max' ];
                    break;
                
                default:
                    filters[ key ] = queryString[ key ].sort().map( param => param.value );
                    break;

            }

            
        }
    }

    qsParams.forEach( param => {
        let props = param.split( '=' ),
        field = props[ 0 ][ 0 ] === 'p' ? props[ 0 ].substring( 1 ) : props[ 0 ],
        value = decodeURI( props[ 1 ] ); 

        if( field === '' ) return; // ignore blank fields

        if( value === 'select all' ) return; // skip it, this is functionally the same as having no filter

        if( value === 'select none' ){
            filters[ field ] = [];

        } else {
            let values = value.split( '|' );

            if( field === 'd' ){
                let index = values.indexOf( 'sel' );
                values.splice( index, 1 );
            } else if( field === 'qsfv' ){
                return filters.qsfv = value;
            }

            filters[ field ] = values;
        }

    });

    return { ...filters };
}

export default { filterURL, buildFilter };