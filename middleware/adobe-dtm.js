import reporter from 'redux-reporter';

export default reporter( ({ type, payload }, getState ) => {
    try {
        window._satellite.track( type );
    } catch (err) {
        console.error( `Adobe DTM Event failed: ${ type }`, err );
    }
 
});