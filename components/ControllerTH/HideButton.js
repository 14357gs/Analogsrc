import React from 'react';
import { toggleColumn } from '../../actions/ActionTypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const HideButton = props => (
    <button className="hide-column" onClick={ 
        e => {
            e.preventDefault();
            props.toggleColumn( props.column );
        }
    }>
        { props.translations.button.hide }
    </button>
);

function mapStateToProps( state ) {
    return {
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ toggleColumn }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( HideButton );