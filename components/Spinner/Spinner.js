import React from "react";
import { connect } from 'react-redux';
import './style.css';

const Spinner = props => (
    <div className="white-out">
        <div className="spinner-container">
            <i className="fa fa-circle-o-notch fa-spin fa-3x"></i>
            <p>{ props.translations.activity }</p>
        </div>
    </div>
);

function mapStateToProps( state ) {
    return {
        translations: state.app.translations
    };
}

export default connect( mapStateToProps )( Spinner );