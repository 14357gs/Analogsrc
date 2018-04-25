import React from 'react';
import PropTypes from 'prop-types';
import RCSlider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import Magnitudes from '../../utilities/magnitudes';
import './style.css';

/**
 * @name handle
 * @function
 * @param {Object} props Props from the parent component
 * @description Component. The tooltip that appears while manipulating the RCslider
 */
function handle( props ){
    
    const { value, dragging, index, ...restProps } = props;
    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={Magnitudes.determine( this.calculateValue( value) , this.props.valueType, this.props.significantDigits, this.props.valueType !== 'Engineering' )}
            visible={dragging}
            placement="right"
            key={index} >
            <RCSlider.Handle value={ this.calculateValue( value ) } {...restProps} />
        </Tooltip>
    );
};

class Slider extends React.Component {

    constructor( props ){
        super( props );
        this.state = this.createState( props );
    }

    /**
     * Props are passed into this object to ensure the class receives the proper information 
     * during the `componentWillReceiveProps` cycle.
     * @name createState
     * @param {JSON} props Props from the class. 
     * @param {string|number|null} props.min The minimum value the slider can display
     * @param {string|number|null} props.max The maximum value the slider can display
     * @param {array} defaults The default values the slider should display
     * @returns {JSON} Data that should be entered into the state
     * @description Determines the appropriate values to display in the slider and sets
     *              the slider as disabled if necessary.
     */
    createState( props ){

        let min = parseFloat( props.min ), 
        max = parseFloat( props.max ), 
        disabled = this.checkInvalidity( props.min, props.max ), 
        defaults = props.defaults.map( this.handleDefaults );

        if( disabled ){
            min = 0; 
            max = 100;
            defaults = [ 0, 100 ];
        }

        return {
            difference: ( max - min ), // difference of min and max, used for obtaining percentage values
            min, // this is the absolute lowest value possible
            max, // this is the absolute highest value possible
            defaults,
            disabled
        };
    }

    /** 
     * @name checkInvalidity
     * @param {*} min Intended to be numbers, but could be anything. Minimum alue for the slider.
     * @param {*} max Intended to be numbers, but could be anything. Maximum value for the slider.
     * @returns {boolean} The state of invalidity. True is invalid, false is valid.
     * @description Checks if the provided min and max are invalid numbers. Invalid numbers 
     *              consist of identical numbers (i.e. `min` and `max` are the same value), 
     *              `String`, `Object`, `undefined`, and `null`
    */
    checkInvalidity( min, max ){ 
        return ( min === max || !min || !max || isNaN( min ) || isNaN( max ) );
    }

    /**
     * @name handleDefaults
     * @function
     * @param {string|number} value The min/max value that was passed into the component.
     * @description Map function that converts the min/max values to values that can be used by RCSlider. If the value isNaN then the value that was passed into handleDefaults is returned. It is expected that NaN values are either strings "min" or "max".
     */
    handleDefaults = value => ( !isNaN( value ) ) ? parseFloat( value ) : value

    componentWillReceiveProps( nextProps ){
        this.setState( this.createState( nextProps ) );
    }

    shouldComponentUpdate( nextProps ){
        let defaults = nextProps.defaults.map( value => parseFloat( value ) );
        if( nextProps.column !== this.props.column ) return true;       // if column has been dragged to a new position
        if( defaults[ 0 ] !== this.state.defaults[ 0 ] ) return true;   // if maximum value has changed
        if( defaults[ 1 ] !== this.state.defaults[ 1 ] ) return true;   // if minimum value has changed
        return false; // component hasn't changed, save the effort
    }

    static propTypes = {
        min: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired, // minimum value of the slider
        max: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired, // maximum value of the slider
        defaults: PropTypes.array, // default values of the slider: [ min, max ]
        onChange: PropTypes.func.isRequired, // slider "sliding" callback
        onAfterChange: PropTypes.func.isRequired, // slider "finished changes" callback
        valueType: PropTypes.oneOf( [ 'Engineering', 'Standard' ] ).isRequired, // Type of value to display in the tooltip
        significantDigits: PropTypes.number.isRequired, // amount of digits to display in the tooltip
        column: PropTypes.string.isRequired // Name of the column, used exclusively in shouldComponentUpdate() to determine drag and drop columns
    }

    /**
     * @name handleChange
     * @function
     * @param {string} type name of the prop method to be executed after the function has been initiated.
     * @param {array} values min and max values produced by the slider, respectively.
     * @description Fires the appropriate callback function for both updating the parent component
     */
    handleChange( type, values ){
        let min = this.calculateValue( Math.min( ...values ) ),
        max = this.calculateValue( Math.max( ...values ) );
        this.props[ type ]( min, max );
    }

    /**
     * @name calculateValue
     * @function
     * @param {number} percent percent of the range to calculate as a number value
     * @returns {number}
     * @description Determines actual value coming out of RCSlider as a number and not a percentage
     */
    calculateValue( percent ){
        return ( ( percent * this.state.difference / 100 ) + this.state.min );
    }

    /**
     * @name calculatePercent
     * @function
     * @param {string|number} value If a number, is used to calculate a percentage. If string (min|max), returns its respective percentage (0|100)
     * @returns {number}
     * @description Determines percentage of numbers in the range to be used by RCSlider
     */
    calculatePercent = value => {
        if( value === 'min' ) return 0;
        if( value === 'max' ) return 100;
        return ( ( value - this.state.min ) * 100 ) / this.state.difference; 
    }

    render() {

        let defaults = this.state.defaults.map( this.calculatePercent );

        if( isNaN( this.state.max ) || isNaN( this.state.min ) || isNaN( defaults[ 0 ] ) || isNaN( defaults[ 1 ] ) ) return null;

        return(
            <div className="slider">
                <RCSlider.Range
                    min={ 0 }
                    max={ 100 }
                    allowCross={false}
                    pushable={ 12 }
                    vertical
                    handle={ handle.bind( this ) }
                    disabled={ this.state.disabled }
                    calculateValue={ this.calculateValue }
                    onChange={ this.handleChange.bind( this, 'onChange' ) }
                    onAfterChange={ this.handleChange.bind( this, 'onAfterChange' ) }
                    value={ defaults } />
            </div>
        );
                  
    }
}

export default Slider;