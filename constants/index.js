import english from './translations/english';
import russian from './translations/russian';
import japanese from './translations/japanese';
import chinese from './translations/chinese';

let url = window.location.pathname.split( '/' ),
stupidLanguage = lang => {

    switch( lang ){
        case 'ja':
            return 'jp';
            
        default:
            return lang;
    }

},
// just because we have to be difficult
stupidLanguage2 = lang => {

    switch( lang ){
        case 'ja':
            return 'jp';
        case 'zh':
            return 'cn';
        default:
            return lang;
    }

},
translations = lang => {
    switch( lang ){
        case 'cn':
        case 'zh':
            return chinese;

        case 'jp':
        case 'ja':
            return japanese;
        
        case 'ru':
            return russian;

        case 'en':
        default:
            return english;
    }
};
 
// data
export const PST_ID = url[ url.length - 1 ];
export const INFINITY = 1 * Math.pow(10, 60); //1e60
export const NEGINFINITY = -1 * Math.pow(10, 60); //-1e60
export const IE11 = ( !!window.MSInputMethodContext && !!document.documentMode );
export const LANG = document.documentElement.lang.toLowerCase();
export const HOST = ( location.host !== 'localhost:3000' ) ? location.host : 'www-dev.corpnt.analog.com';
export const URL_ENV = `http://${ HOST }`;
export const TRANSLATIONS = translations( LANG );

// Endpoints
export const ENDPOINT_DATA = `${ URL_ENV }/cdp/pst/data/${ stupidLanguage( LANG ) }/`;
export const ENDPOINT_HEADER = `${ URL_ENV }/cdp/pst/view/${ stupidLanguage( LANG ) }/${ PST_ID }.js`;
export const ENDPOINT_PARAMETERS = `${ URL_ENV }/cdp/pst/parametermapping.js`;
export const ENDPOINT_EXCEL = `${ URL_ENV }/${ stupidLanguage2( LANG ) }/parametricsearch/PSTHandler/DownloadPstAsExcel`;
export const ENDPOINT_QUICK_SEARCH = `${ URL_ENV }/${ stupidLanguage( LANG ) }/parametricsearch/api/QuickFilter/?pstId=${ PST_ID }&type=pst`;

// Environments
export const DEV_ENV = "development";
export const NONPROD_ENV = "nonprod";
export const PROD_ENV = "prod";