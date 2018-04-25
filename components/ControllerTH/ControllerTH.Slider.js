import React from 'react';
import Slider from '../Slider';
import { modifyFilter } from '../../actions/ActionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Magnitudes from '../../utilities/magnitudes';
import './style.css';

class SliderTH extends React.Component {

    constructor( props ){
        super( props );

        let status = this.determinEngineering( props.parameters[ props.column.field ] ),
        minMax = this.determineMinMax( props );

        this.state = {
            significantDigits: 4,
            ...status,
            ...minMax
        };

        this.debounce = undefined; // used by debounceOnChange, don't remove

    }

    shouldComponentUpdate( nextProps, nextState ){

        let condition1 = nextProps.column.field !== this.props.column.id,
        condition2 = nextProps.minimized !== this.props.minimized,
        condition3 = JSON.stringify( nextProps.filter[ nextProps.column.field ] ) !== JSON.stringify( this.props.filter[ this.props.column.id ] ),
        condition4 = ( nextState.min !== this.state.min || nextState.max !== this.state.max );

        return ( condition1 || condition2 || condition3 || condition4 );
    }

    componentDidUpdate(){
        let options = [ this.state.type, this.state.significantDigits, !this.state.engineering ],
        min = Magnitudes.determine( Number( this.state.min ), ...options ),
        max = Magnitudes.determine( Number( this.state.max ), ...options );
        if( min !== this.refs.min.value ) this.refs.min.value = min;
        if( max !== this.refs.max.value ) this.refs.max.value = max;
    }

    componentWillReceiveProps( nextProps ){        
        let status = this.determinEngineering( nextProps.parameters[ nextProps.column.field ] ),
        minMax = this.determineMinMax( nextProps );
        this.setState({ ...status, ...minMax });
    }

    /**
     * @name determineMinMax
     * @param {*} props 
     * @returns {Object}
     * @description Determines the appropriate min and max values for the slider
     */
    determineMinMax( props ){
          
        let min = Number( props.column.min ),
        max = Number( props.column.max );

        if( props.filter[ props.column.field ] ){
            if( props.filter[ props.column.field ][ 0 ] !== 'min' ) min = Number( props.filter[ props.column.field ][ 0 ] );
            if( props.filter[ props.column.field ][ 1 ] !== 'max' ) max = Number( props.filter[ props.column.field ][ 1 ] );
        }

        return { min, max };
    }

    /**
     * @name determinEngineering
     * @function
     * @param {*} parameters props.parameters[ props.column.field ]
     * @returns {Object}
     * @description Determines if the current slider uses engineering or standard notation
     */
    determinEngineering( parameters ){

        let state = {
            engineering: false,
            type: 'Standard'
        };

        if( parameters && parameters.hasMagnitude ){
            state.engineering = true;
            state.type = 'Engineering';
        }

        return state;
    }

    /**
     * Utilized by slider only!
     * @name updateInput
     * @function
     * @param {string|number} min 
     * @param {string|number} max 
     * @description Updates the text inputs during slider manipulation
     */
    updateInput( min, max ){
        let options = [ this.state.type, this.state.significantDigits, !this.state.engineering ]
        this.refs.min.value = Magnitudes.determine( Number( min ), ...options );
        this.refs.max.value = Magnitudes.determine( Number( max ), ...options );
        this.setState({ min, max });
    }

    /**
     * @name updateFilter
     * @function
     * @param {string} type Type of input that caused the filter update. Expects `slider` or `text`, other values interpretted as `text`.
     * @description Applies the new values to the table filter
     */
    updateFilter( type ){
        
        let min, max,
        update = false, // used to determine if the slider text inputs should be updated after erroneous entry
        options = [ this.state.type, this.state.significantDigits, !this.state.engineering ];

        switch( type ){
            case 'slider':
                min = arguments[ 1 ];
                max = arguments[ 2 ];
                break;
            case 'text':
            default:

                min = Magnitudes.userEntryToNumber( this.refs.min.value )[ 0 ];
                max = Magnitudes.userEntryToNumber( this.refs.max.value )[ 0 ];

                if( isNaN( min ) || isNaN( max ) ) return;

                // prevent entry on number outside the valid range
                if( min > max ){
                    update = true;
                    min = max - 0.1;
                }

                if( min < this.props.column.min ){
                    update = true;
                    min = this.props.column.min;
                }

                if( max > this.props.column.max ){ 
                    update = true;
                    max = this.props.column.max;
                }
                
                break;
        }
        
        // if user enters a value that is impossible or outside of the range, reset the inputs to values that are possible
        if( update ){
            this.refs.min.value = Magnitudes.determine( min, ...options );
            this.refs.max.value = Magnitudes.determine( max, ...options );
        }

        this.setState({ min, max });
        this.props.modifyFilter( 'range', this.props.filter, this.props.column.field, true, [ min, max ]);

    }

    /**
     * @name debounceOnChange
     * @description Offsets the realtime updating of filter values via text input
     */
    debounceOnChange(){
        if( this.debounce ) clearTimeout( this.debounce );
        this.debounce = setTimeout( this.updateFilter.bind( this, 'text' ), 700 );
    }

    render(){

        let options = [ this.state.type, this.state.significantDigits, !this.state.engineering ], // do this because i'm lazy
        text = {
            min: Magnitudes.determine( Number( this.state.min ), ...options ),
            max: Magnitudes.determine( Number( this.state.max ), ...options )
        },
        defaults = [ this.state.min, this.state.max ],
        minKey = `${ this.props.column.field }-min`,
        maxKey = `${ this.props.column.field }-max`;

        if( this.props.minimized ){
            return (
                <div className="sliderVals">
                    <input type="text" defaultValue={ text.min } onChange={ this.debounceOnChange.bind( this ) } ref="min" key={ minKey } />
                    -
                    <input type="text" defaultValue={ text.max } onChange={ this.debounceOnChange.bind( this ) } ref="max" key={ maxKey } />
                </div>
            );
        } else {

            return (
                <div>
                    <span className="sliderVals">
                        &le; <input type="text" defaultValue={ text.max } onChange={ this.debounceOnChange.bind( this ) } ref="max" key={ maxKey } />
                    </span>
                    <div className="clear-fix"></div>
                    <div className="slider-wrapper">
                        <Slider 
                            key={ `${ this.props.column.field }-slider` } 
                            column={ this.props.column.field } 
                            significantDigits={ this.state.significantDigits } 
                            valueType={ this.state.engineering ? 'Engineering' : 'Standard' } 
                            min={ this.props.column.min } 
                            max={ this.props.column.max } 
                            defaults={ defaults } 
                            onChange={ this.updateInput.bind( this ) } 
                            onAfterChange={ this.updateFilter.bind( this, 'slider' ) } />
                    </div>
                    <div className="clear-fix"></div>
                    <span className="sliderVals">
                        &ge; <input type="text" defaultValue={ text.min } onChange={ this.debounceOnChange.bind( this ) } ref="min" key={ minKey } />
                    </span>
                </div>
            );
        }
    }

}

function mapStateToProps( state ) {
    return {
        minimized: state.app.minimized,
        parameters: state.app.parameters,
        filter: state.app.filter
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ modifyFilter }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( SliderTH );