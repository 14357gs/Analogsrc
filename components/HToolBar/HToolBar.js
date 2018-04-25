import React from 'react';
import Parameters from '../../components/Parameters';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Email from '../Email';
import Excel from '../Excel';
import { minimizeControls, selectAllParameters, handleModal, sortByNewest, displayColumns, reset, sendColumnToFront, addStep } from '../../actions/ActionTypes';
import { IE11 } from '../../constants';
import tableReset from '../../img/HToolBar/icon-table-reset.png';
import toggleFilter from '../../img/HToolBar/icon-toggle-filter.png';
import sortNewest from '../../img/HToolBar/icon-sort-newest.png';

import './style.css';

class HToolBar extends React.Component {

    componentDidMount(){

        this.props.addStep([{
            title: 'Welcome to Quick Tips Tour',
            text: 'Click previous and next to explore the latest page enhancements.',
            selector: '.h-tool-bar .quick-tips',
            position: 'bottom',
            style: {
                beacon: {
                    display: 'none'
                }
            }
        },
        {
            title: 'Select All Parameters',
            text: 'You can "choose parameters" or "select all" parameters from menu.',
            selector: '.h-tool-bar .parameter-buttons',
            position: 'bottom',
            isFixed: true
        },
        {
            title: 'Share Filtered Table',
            text: 'Email the table with your filter presets saved for the recipient.',
            selector: '.h-tool-bar .h-bar-button.green a:nth-child( 2 )',
            position: 'top',
            isFixed: true
        }]);
        
    }

    handleResetTable = e => {
        e.preventDefault();
        this.props.reset();
        document.getElementById( 'pst-form' ).reset();
        location.hash = '#/';

        let qsForm = document.querySelector( 'section.quick-search form' );
        if( qsForm ) qsForm.reset();
    };

    handleMinimizeTable = e => {
        e.preventDefault();
        this.props.minimizeControls(this.props.minimized);
    }

    render(){

        let classes = [ 'h-tool-bar' ];

        if( IE11 ) classes.push( 'ie11' );

        return(
            <div className={ classes.join( ' ' ) }>
                <Parameters show={ this.props.showModal }/>
                <div>
                    <span className="h-bar-button parameter-buttons">
                        <a href="#" onClick={
                            e => {
                                e.preventDefault();
                                this.props.handleModal( this.props.showModal )
                            }
                        }>
                            { this.props.translations.button.parameters.choose }
                        </a>
                        <a href="#" onClick={
                            e => {
                                e.preventDefault();
                                this.props.displayColumns();
                                this.props.sendColumnToFront(this.props.columns,'s6' );
                            }
                        }>
                            { this.props.translations.button.parameters.all }
                        </a>
                    </span>
                    <span className="pipe">|</span>
                    <span className="h-bar-button">
                        <a href="#" onClick={ this.handleResetTable }>
                            { this.props.translations.button.reset }
                            <img src={ tableReset } alt={ this.props.translations.button.reset } />
                        </a>
                        <a href="#" onClick={ this.handleMinimizeTable }>
                            { this.props.minimized ? this.props.translations.button.filters.minimize : this.props.translations.button.filters.maximize }
                            <img src={ toggleFilter } alt={ `Toggle Filters`} />
                        </a>
                        <a
                            href="#"
                            onClick={
                                e => {
                                    e.preventDefault();
                                    this.props.sortByNewest();
                                }
                            }>
                                { this.props.translations.button.sortByNewest }
                                <img src={ sortNewest } alt={ this.props.translations.button.sortByNewest } />
                        </a>
                    </span>
                    <span className="h-bar-button green">
                        <Excel />
                        <Email />
                    </span>
                    <span className="h-bar-button orange">
                        <a href="#" className="quick-tips" onClick={ 
                            e=> {
                                e.preventDefault();
                                this.props.resetWalkthrough();
                            }
                        }>
                            { this.props.translations.button.quickTips }
                        </a>
                    </span>
                </div>
            </div>
        );
    }
}
function mapStateToProps( state ){
    return {
        minimized: state.app.minimized,
        parameters: state.app.parameters,
        columns: state.app.columns,
        showModal: state.app.showModal,
        translations: state.app.translations,
        quickSearch: state.app.quickSearch
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ minimizeControls, selectAllParameters, handleModal, sortByNewest, displayColumns, reset, sendColumnToFront, addStep }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HToolBar);
