import { INFINITY, NEGINFINITY } from '../constants';

/**
    @name metricStringToNumber
    @function
    @param {string} textFromUser 
    @param {Object} regEx 
    @param {number} exponent 
    @description This function takes a string with a metric suffix and returns a number
*/
export const metricStringToNumber = ( textFromUser, regEx, exponent ) => {
    var number, 
    pattern,
    expo = Math.pow( 10, exponent ),
    chopSomeDigitsOff; //multiply by exponent
    
    textFromUser = textFromUser.replace(regEx, "").toString(); //remove the suffix

    //check if rest of the part has digits and decimal
    if( !textFromUser.match(/[0-9]$/g) && !textFromUser.match(/\W+/g) ) return NaN;
        
    pattern = parseFloat(textFromUser); //turn the number into numeric format
    number = expo * pattern;
    chopSomeDigitsOff = number.toPrecision(12); //Limit to 12 significant digits to avoid floating point errors, Otherwise you can get stuff like 30 * 1e-9 = 3.0000000000000004e-8
    return parseFloat( chopSomeDigitsOff );

};

/**
    @author Created by : Archita Ghosh on behalf of Collaborative Consulting and ADI
    @name userEntryToNumber
    @function
    @param {string} textFromUser user inputs the text
    @returns number and a boolean value invalidUserEntry
    @description Converts user's entry into a number the rest of the program can work with.
    This function now accepts positive and negative float values.
*/
export const userEntryToNumber = textFromUser => {

    if( !textFromUser ) return [ undefined, undefined ];

    let invalidUserEntry = false, // boolean value setting to false.
    number,
    patterninf = /^inf/i, // i is search with ignore case character and ^ is to search the start of a string, $ matches the end of the string
    patternNeginf = /^-inf/i; // pattern for negative infinity

    textFromUser = textFromUser.replace(/\s+/g, ""); // trimming all the spaces which user can input

    if (textFromUser.match(patterninf)) {
        number = INFINITY;
    }
    else if (textFromUser.match(patternNeginf)) {
        number = NEGINFINITY;
    }
    else if (textFromUser.match(/T$/g)) {
        number = metricStringToNumber(textFromUser, /T$/g, 12);
    }
    else if (textFromUser.match(/G$/g)) { // checks if the last character is G
        number = metricStringToNumber(textFromUser, /G$/g, 9);
    }
    else if (textFromUser.match(/M$/g)) { // checks if the last character is M
        number = metricStringToNumber(textFromUser, /M$/g, 6);
    }
    else if (textFromUser.match(/k$/g)) { // checks if the last character is k
        number = metricStringToNumber(textFromUser, /k$/g, 3);
    }
    else if (textFromUser.match(/m$/g)) {
        number = metricStringToNumber(textFromUser, /m$/g, -3);
    }
    else if (textFromUser.match(/u$/g)) {
        number = metricStringToNumber(textFromUser, /u$/g, -6);
    }
    else if (textFromUser.match(/n$/g)) {
        number = metricStringToNumber(textFromUser, /n$/g, -9);
    }
    else if (textFromUser.match(/p$/g)) {
        number = metricStringToNumber(textFromUser, /p$/g, -12);
    }
    else if (textFromUser.match(/f$/g)) {
        number = metricStringToNumber(textFromUser, /f$/g, -15);
    }
    else if (textFromUser.match(/a$/g)) {
        number = metricStringToNumber(textFromUser, /a$/g, -18);
    }
    else if (textFromUser.match(/E/gi)) {
        number = textFromUser;
    }
    else if (textFromUser.match(/^[-+]?[0-9]*$/g) || textFromUser.match(/^[-+]?(?:\d*\.\d{0,20}|\d+)$/)) {
        textFromUser = parseFloat(textFromUser);
        number = Number(textFromUser);
    }
    else if (textFromUser.match(/s$/g)) {
        number = textFromUser;
    }
    else {
        number = "";
        invalidUserEntry = true;
    } //end of else if chain

    if( isNaN( number ) || ( !number && number !== 0 ) ) number = ""; //end of  if // if the number is NaN, it will return a space

    return [ number, invalidUserEntry ];
}

/**
    @name removeZeroes
    @function
    @param {string} numberString 
    @description Remove extra zeroes.  Assumes numberString starts with number
*/
export const removeZeroes = numberString => {
    
    let matchReturn = numberString.match(/^[0-9]+\.[0-9]+/); //Must have numbers followed by a period followed by more numbers for this function to do anything

    if ( !matchReturn ) return numberString;

    let numberWithZeroes = numberString.slice(0, matchReturn[0].length),
    restOfString = numberString.slice( matchReturn[0].length ),
    numberWithoutZeroes = numberWithZeroes.replace(/0*$/, ''),
    remDot = numberWithoutZeroes.replace( /\.$/, '' ); // removing the trailing dot
    return ( remDot + restOfString );
        
};

/** 
    processEngTextNoDecimal function
    @name processEngTextNoDecimal
    @function
    @param {number} value
    @param {number} powToRaiseTo
    @returns 
    @description Raises a number to a power of 10 without needing to use the decimal value of the number if possible.
    Example where this function helps; previously the following could happen:  1.1*Math.pow(10,2) = 110.00000000000001
    This function turns the above into 11*Math.pow(10,1)
    <p><b>INPUT :</p></b>
    <p><b>OUTPUT : </p></b>
*/
export const processEngTextNoDecimal = ( value, powToRaiseTo ) => {
    
    if( isNaN(value) ) return " ";

    let decrementer = 0,
    powValue = powToRaiseTo,
    modifiedValue = value,
    valuePieces = value.split(".");

    if (valuePieces.length > 1) {
        decrementer = valuePieces[1].length;
        modifiedValue = value.replace(".", "");
    }

    powValue = powToRaiseTo - decrementer;

    if (powValue < 0) {
        modifiedValue = value;
        powValue = powToRaiseTo;
    }

    return modifiedValue * Math.pow(10, powValue);
};

/**
    @name numberInSuffixRange
    @function
    @param {string} suffix engineering suffix of the band we want to check
    @param {string} bigSuffix next biggest suffix, in case of numbers like 999.9999 which get rounded up
    @param {number} smallestNumber lowest number in the range.  For example if small suffix is k, then this is 1000
    @param {number} numberToCheck the number we actually want to check
    @param {number} significantDigits how many significant digits the returned number should have
    @description Checks if the number is in a range that matches an engineering suffix
    For example if suffix is 'k', this function checks if the number is between 1000 and 1e6
    Returns null if number not in range, otherwise returns formatted number
*/
export const numberInSuffixRange = ( suffix, bigSuffix, smallestNumber, numberToCheck, significantDigits ) => {
    
    let engineeringText,
    suffixToUse,
    smallValToCheck = smallestNumber * 1000;

    if( numberToCheck >= smallValToCheck.toPrecision( 15 ) ) return null;

    engineeringText = ( ( numberToCheck / smallestNumber).toPrecision( significantDigits ) ).toString() + suffix;

    //if the orginal number was 100,000, after the multiplication it will be 100 which the toPrecision will convert to something like 1.02e+2 
    //To avoid showing the customer something like 1.0e+2k, we have the code below
    var eMatch = engineeringText.match(/e/i);
    if( eMatch ){
        
        var significand = engineeringText.slice(0, eMatch.index),
        exponent = engineeringText.slice(eMatch.index + 2, eMatch.index + 3);

        if (exponent === '3') {
            suffixToUse = bigSuffix; exponent = '0';
        }
        else {
            suffixToUse = suffix;
        }
        engineeringText = processEngTextNoDecimal(significand, exponent) + suffixToUse;
    }

    return engineeringText;
        
};

/**
    @name engineering
    @function
    @param {number} number 
    @param {number} significantDigits 
    @param {boolean} showZeroes 
    @description formats the provided number with engineering units (i.e. 7,000,000 becomes 7G, where G represents Gig)
*/
export const engineering = ( number, significantDigits, showZeroes ) => {

    let absNumber = Math.abs( number ),
    sign = number / absNumber,
    smallestNumber = 1e-18,
    loopFinished = true,
    suffixList = [ 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P' ],
    engineeringText;

    if( absNumber < smallestNumber ) return '0';

    for( let i = 0; i < suffixList.length; ++i ){
        
        //Check if number is a number that would normally have suffixList[i] after it. If so, return formatted number.        
        engineeringText = numberInSuffixRange( suffixList[i], suffixList[ i + 1 ], smallestNumber, absNumber, significantDigits);

        if( engineeringText ){
            loopFinished = false;
            break;
        }

        smallestNumber *= 1000;
    }

    if( loopFinished ) engineeringText = "Inf";
        
    if( showZeroes === false ) engineeringText = removeZeroes( engineeringText );
    
    if( sign < 0 ) engineeringText = '-' + engineeringText;

    return engineeringText;
}

/**
    @name determine
    @function
    @param {number} number 
    @param {string} displayFormat 
    @param {number} significantDigits 
    @param {boolean} showZeroes 
    @description determines how a number is converted
*/
export const determine = ( number, format, significantDigits, showZeroes ) => {
    let text;

    //check for valid input
    if( number === 0 ) return '0';
    if( isNaN( number ) || !number ) return ""; 

    // limit number to our definition of inifity
    if( number >= INFINITY ){
        return "Inf";
    } else if( number <= NEGINFINITY ){ 
        return "-Inf";
    }

    // //Allow this function to be used with string inputs as well.
    if (typeof number === 'string' || number instanceof String) {
        number = number.trim();

        if (number.match(/[a-zA-Z]/gi)) {
            var call_userEntryToNumber = userEntryToNumber( number );
            number = call_userEntryToNumber[0];
        }

        if( number === "" || isNaN(number) ) return "";
    }

    // notation type
    switch( format ){
        case 'Engineering':
            return engineering( number, significantDigits, showZeroes );

        case 'Scientific':
            text = number.toExponential( significantDigits );
            if( !showZeroes ) text = removeZeroes( text );
            return text;

        default:
            text = Number( number ).toPrecision( significantDigits ).toString();
            if( !showZeroes ) text = removeZeroes( text );
            return text;
    }

};

export default { determine, userEntryToNumber };