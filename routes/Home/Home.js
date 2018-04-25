import React from 'react';
import ParametricSearch from '../ParametricSearch';
import SubHeader from '../../components/SubHeader';
import HToolBar from '../../components/HToolBar';
import Spinner from '../../components/Spinner';
import Notes from '../../components/Notes';
import QuickSearch from '../../components/QuickSearch';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchData} from '../../actions/ActionTypes';
import { IE11 } from '../../constants';
import smoothscroll from 'smoothscroll-polyfill';

import './style.css';

// Walkthrough stuff
import Joyride from 'react-joyride';
import 'react-joyride/lib/react-joyride-compiled.css';

class Home extends React.Component {

    constructor( props ){
        super( props );

        this.state = {
            showWalkthrough: false
        };

        // IE11 only. Used to save memory during scroll
        if( IE11 ){
            this.lastScrollX = 0; 
            this.lastScrollY = 0;
        }
    }

    /**
     * @name resetWalkthrough
     * @description Resets the walkthrough and begins again.
     */
    resetWalkthrough(){
        this.refs.joyride.reset();
        this.setState({ showWalkthrough: true });
    }

    /**
     * @name handleWalkthroughAction
     * @function
     * @param {Object} state Current state of the walkthrough
     * @description Handles what happens during user interactions with the walkthrough
     */
    handleWalkthroughAction = state => {
        switch( state.action ){
            case 'close':
                this.setState({ showWalkthrough: false });
                this.refs.joyride.reset();
                break;
            default:
                if( state.type === 'finished' ){
                    document.body.classList.remove( 'no-scroll' );
                    this.setState({ showWalkthrough: false });
                    this.refs.joyride.reset();
                }
                break;
        }
    }

    componentDidMount(){
        this.props.fetchData();
    }

    shouldComponentUpdate( nextProps, nextState ){
        return ( nextProps.spinner !== this.props.spinner || Object.keys( nextProps.error ).length > 0 ||  this.state.showWalkthrough !== nextState.showWalkthrough );
    }

    componentDidUpdate(){
        if( !this.refs.container ) return;
        if( IE11 && this.refs.container ){
            let toolbar = this.refs.container.querySelector( '.h-tool-bar' ).getBoundingClientRect();
            this.scrollYThreshold = toolbar.top;
            window.onscroll = this.scroll.bind( this );
        }

        let header = document.querySelector( 'div.sub-header' ).getBoundingClientRect();

        if( IE11 ) smoothscroll.polyfill();

        // scroll to page title here because the removal of the activity indicator adjusts the page position
        window.scroll({ 
            top: header.top,
            left: 0,
            behavior: 'smooth' 
        });

        document.body.classList[ this.state.showWalkthrough ? 'add' : 'remove' ]( 'no-scroll' );

    }
    
    /**
     * This is the gatekeeper for the scroll updates for IE11. We limit the execution of
     * the functions to when the scroll position is different than it was the last time
     * we exected this function to reduce the amount of memory usage, since ie11 is 
     * already slow in this context.
     * 
     * We need to do this because of the `position: sticky` incapatability in IE11.
     * This is a decidedly _bad_ method of doing this, however, it is the only option 
     * to acheive the desired result for IE11.
     * @name scroll
     * @param {Object} e Browser event object
     * @description Executes the appropriate functions to accommodate sticky columns in IE11
     */
    scroll = e => {
        if( window.pageXOffset !== this.lastScrollX ) this.scrollX( window.pageXOffset );
        if( window.pageYOffset !== this.lastScrollY ) this.scrollY( window.pageYOffset );
    }

    /**
     * This method only applies to vertical scrolling for IE11. If you're not working
     * in IE11 don't touch this!!
     * @name scrollY
     * @function
     * @param {number} pos The current "Y" or vertical position of the window.
     * @description Toggles class `scolling` on `this.refs.container` which allows
     * the updating of the styles for the `HToolBar`, `ControllerTH`, and `Row` 
     * components.
     */
    scrollY = pos => {
        this.lastScrollY = pos;
        this.refs.container.classList[ pos > this.scrollYThreshold ? 'add' : 'remove' ]( 'scrolling' );        
    }

    /**
     * This method only applies to horizontal scrolling for IE11. If you're not working
     * in IE11 don't touch this!!
     * @name scrollX
     * @function
     * @param {number} pos The current "X" or horizontal position of the window.
     * @description Updates the `styleLeft` stylesheet with the correct position that should be applied to 
     * sticky elements during horizontal scroll.  
     */
    scrollX = pos => {

        this.lastScrollX = pos; // Set this to save memory. Don't run this function if we don't need to.

        // if you want something to be fixed horizontally, add it here.
        this.refs.styleLeft.innerHTML = `
            body.ie11.thm-parametric .breadcrumb.adicrumb, 
            body.ie11.thm-parametric footer, 
            body.ie11.thm-parametric header, 
            body.ie11.thm-parametric header + .container    
            section.quick-search,
            div.sub-header.ie11,
            div.h-tool-bar.ie11,
            div.table-container div.table-row div.sticky div.content, 
            div#columns > form > div.sticky.column { left: ${ pos }px; }

            div#columns > form > div.sticky.column:nth-child( 2 ) { left: ${ pos + 90 }px; }
            
            div.scrolling div.ie11 div#columns { left: -${ pos }px; }`;
    }

    render() {

        let style = { position: 'relative', minHeight: '300px', display: 'inline-block' },
        styleStatic = null;

        if( this.props.spinner ) return <Spinner />;

        if( this.props.networkError && this.props.error.response ) return(
            <div className="container">
                <div className="starter-template">
                    <div className="alert alert-danger" role="alert">
                        <h1>
                            <i className="fa fa-exclamation-circle" aria-hidden="true"></i> &nbsp;
                            { `${ this.props.error.response.status } ${ this.props.error.response.statusText }` }
                        </h1>
                        <p>{ this.props.error.message }</p>
                    </div>
                </div>
            </div>
        );

        if( IE11 ){
            style.overflow = 'hidden';
            document.body.classList.add( 'ie11' );
        }

        return(
            <div ref="container" style={ style }>
                <style ref="styleLeft" />
                { styleStatic }
                <Joyride 
                    ref="joyride" 
                    steps={ this.props.walkthrough } 
                    run={ this.state.showWalkthrough } 
                    autoStart={ this.state.showWalkthrough }
                    holePadding={ 0 }
                    scrollToSteps={ false }
                    scrollToFirstStep={ false }
                    type="continuous" 
                    callback={ this.handleWalkthroughAction } />
                <SubHeader title={this.props.title}/>
                <QuickSearch />
                <HToolBar resetWalkthrough={ this.resetWalkthrough.bind( this ) } />
                <ParametricSearch container={ this.refs.container } />
                <Notes />
            </div>
        );

    }
}

function mapStateToProps( state ){
    return {
        title: state.app.title,
        networkError: state.app.networkError,
        error: state.app.error,
        spinner: state.app.spinner,
        walkthrough: state.app.walkthrough
    };
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ fetchData }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)( Home );