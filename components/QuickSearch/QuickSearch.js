import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { consumeFilter } from '../../actions/ActionTypes';
import { buildFilter } from '../../utilities/filterURL';
import { IE11 } from '../../constants';
import './style.css';

export interface mapWrapperProps{
    asyncScriptOnLoad?:()=>void;
    libraries?:string;
}

class QuickSearch extends React.Component<mapWrapperProps,{}> {

    shouldComponentUpdate( nextProps ){
        return nextProps.quickSearch.hasQuickFilter;
    }
    
    componentDidMount(){
        this.offsetTop();

        if( !this.props.quickSearch.hasQuickFilter ) return;
        
        let submit = this.refs.container.querySelector( '.form-submit button' ),
        showMore = this.refs.container.querySelector( 'button[type="button"][onclick]' ),
        form = this.refs.container.querySelector( 'form' ),
        scripts = this.refs.container.querySelectorAll( 'script' );

        if( !submit || !form ) return; // This won't occur a for long after release, if at all. This is only meant to prevent the app from breaking when PSTs aren't available for that category        

        for( let i = 0; i < scripts.length; ++i ){
            let script = document.createElement( 'script' ); 
            script.src = scripts[ i ].src;
            script.async = true;
            script.type = 'text/javascript';
            script.onload = this.props.asyncScriptOnLoad;
            document.head.appendChild( script );
        }

        this.autofillForm();

        submit.onclick = this.handleSubmit;       
        
        if( showMore ) showMore.onclick = e => {
            e.preventDefault();
            eval( showMore.getAttribute( 'onclick' ) );
            this.offsetTop();          
        }
    }

    /** 
     * This method is intended for use in IE11 _only_. This file was chosen for this functionality because
     * the styling update needs to occur _after_ user interactions with the quick search form.
     * 
     * Although, this is arguably a bad practice, it would be inefficient to broadcast the offset and then 
     * apply it all individually to each component, so we're just updating them all here. 
     * @name offsetTop
     * @function
     * @description Updates the css for the toolbar and the table to accommodate the absolute positioning of
     * these elements in IE11.
     */
    offsetTop(){

        if( !IE11 || !this.refs.container ) return;

        let quickSearch = ( this.refs.container.clientHeight + 25 ), // 25 = margin bottom. 
        title = document.querySelector( 'div.sub-header' ).clientHeight,
        toolbar = document.querySelector( 'div.h-tool-bar' ),
        headers = document.querySelector( 'div#columns' ),
        rows = document.querySelector( '.parametric-search.ie11.minimized .table-container' );

        toolbar.style.top = `${ quickSearch + title }px`;
        headers.style.top = `${ quickSearch + title + toolbar.clientHeight }px`;
        rows.style.paddingTop = `${ quickSearch + 3 }px`; // 3 =  border width

    }

    /**
     * We need to add the `hashchange` event listener here because of the disconnect of the quickfilter 
     * form. Since the form is not truly a react component, we have no other way of tracking when the url 
     * conversion script in the form has actually finished executing.
     * @name handleSubmit
     * @function
     * @param {Object} e Browser event object
     * @description Stops the form from submitting and adds the hashchange listener to the window. 
     */
    handleSubmit = e => {
        e.preventDefault(); 
        window.addEventListener( 'hashchange', this.handleHashChange );        
    }

    /**
     * We get rid of the `hashchange` event listener here in order to prevent the filter from constantly 
     * updating after user interaction.
     * @name handleHashChange
     * @function
     * @param {Object} e Browser event object
     * @description Updates the filter based on the changed hash, then kills the hash listener
     */
    handleHashChange = e => {
        this.props.consumeFilter( buildFilter() );
        window.removeEventListener( 'hashchange', this.handleHashChange );
    }

    /** 
     * @name autofillForm
     * @function
     * @description Prepopulates the form to reflect the existing quicksearch
    */
    autofillForm(){

        if( !this.props.filter.qsfv ) return;

        this
            .props
            .filter
            .qsfv
            .split( '_' )
            .forEach( param => {
                let values = param.split( '|' ),
                id = values[ 0 ],
                value = values[ 1 ],
                elem = this.refs.container.querySelector( `#${ id }` );

                if( !elem ) return; // fail safe, don't break because someone tried to make up field values

                switch( elem.tagName.toLowerCase() ){
                    
                    case 'select':
                        elem.querySelector( `option[value="${ value }"]` ).selected = true;
                        break;

                    case 'input':

                        switch( elem.type ){

                            case 'text':
                                elem.value = value;
                                break;

                            case 'checkbox':
                            default:
                                elem.checked = true;
                                break;

                        }

                        break;
                    
                    default:
                        elem.value = value;
                        break;
                }

            });
        }

    render(){
        if( !this.props.quickSearch.hasQuickFilter ) return null;

        let classes = [ 'quick-search' ];

        if( IE11 ) classes.push( 'ie11' );

        return ( <section className={ classes.join( ' ' ) } ref="container" dangerouslySetInnerHTML={{ __html: this.props.quickSearch.quickFilter }} /> );
    }

}

function mapStateToProps( state ) {
    return {
        quickSearch: state.app.quickSearch,
        filter: state.app.filter
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ consumeFilter }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( QuickSearch );