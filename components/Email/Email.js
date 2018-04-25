import React from 'react';
import tableShare from '../../img/HToolBar/icon-table-share.png';
import { bindActionCreators } from 'redux';
import { dtmEvent } from '../../actions/ActionTypes';
import {connect} from 'react-redux';

const Email = props => (
    <a href="#" onClick={ e => {
        e.preventDefault();
        props.dtmEvent( 'share' );
        window.location = `mailto:?subject=PST%20-%20${ encodeURIComponent( props.title ) }&body=${ encodeURIComponent( document.location.toString() ) }`;
    }}>
        { props.translations.button.share }
        <img src={ tableShare } alt={ props.translations.button.share } />
    </a>
);

function mapStateToProps( state ){
    return {
        title: state.app.title,
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ dtmEvent }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( Email );