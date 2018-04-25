import React from "react";
import { hoverProduct, dtmEvent } from '../../actions/ActionTypes';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Constants from '../../constants';
import './style.css';

class PopOver extends React.Component {
    
    constructor( props ){
        super( props );
        this.state = {
            position: {
                top: 0,
                left: 0
            }
        };
    }

    shouldComponentUpdate( nextProps ){
        return ( nextProps.product.id !== this.props.product.id )
    }

    componentWillReceiveProps( nextProps ){

        if( !nextProps.product.id ) return;

        let headers = document.querySelectorAll( 'body > header' ),
        headerHeight = 0,
        target = document.getElementById( nextProps.product.id ),
        pos = target.getBoundingClientRect(),
        top = ( pos.y + ( target.offsetHeight / 2 ) ),
        scrollY = window.scrollY,
        scrollX = window.scrollX,
        offset = 145;

        if( Constants.IE11 ){
            top = ( pos.top + ( target.offsetHeight / 2 ) );
            scrollY = window.pageYOffset;
            scrollX = window.pageXOffset;
        }

        // for dev, qa, and production only. For some reason, their presence effects how the y position of the target on the screen is calculated
        if( headers.length > 0 ){ 
            headerHeight += 19;
            for( let i = 0; i < headers.length; ++i ) headerHeight += headers[ i ].offsetHeight;
        }

        this.setState({ 
            position: {
                top: ( scrollY - headerHeight + top - offset ) + 'px',
                left: ( scrollX  + 90 + ( target.offsetWidth  / 2 ) ) + 'px'
            }
        });
        
    }

    /**
     * @name determineHide
     * @param {Object} e Browser event object
     * @description Determines is the popover should be hidden
     */
    determineHide = e => {
        e.stopPropagation();
        if( !e.relatedTarget ) return;
        let nextElement = e.relatedTarget,
        test1 = nextElement.dataset.id === this.props.product.id,
        test2 = nextElement.id === this.props.product.id;
        if( !test1 && !test2 ) this.props.hoverProduct({});
    }

    /**
     * @name handleClick
     * @function
     * @param {Object} e Browser event object
     * @description Hide popover after click
     */
    handleClick = e => {
        e.preventDefault();
        window.open( e.currentTarget.href );
        this.props.dtmEvent( e.currentTarget.href.includes( 'datasheet' ) ? 'downloadDataSheet' : 'productView' );
        this.props.hoverProduct({});
    }

    render(){

        if( !this.props.product.name ) return null;

        let recommendation = ( this.props.product.recommendation ) ? <div className="recommended">{ this.props.product.recommendation }</div> : null;

        return (
            <div 
                className="popover-pst" 
                style={ this.state.position }
                onMouseLeave={ this.determineHide }>
                <div className="col-md-6 details">
                    <div>
                        <h3>
                            <a href={ `${ Constants.URL_ENV }/en/${ this.props.product.generic }` } onClick={ this.handleClick } target="_blank">
                                { this.props.product.name }
                            </a>
                        </h3>
                        <p>{ this.props.product.description }</p>
                        { recommendation }
                    </div>
                    <ul>
                        <li><a href={ `${ Constants.URL_ENV }/en/${ this.props.product.generic }/datasheet`} target="_blank" onContextMenu={ e => this.props.dtmEvent( 'rightClickDownloadDataSheet' ) } onClick={ this.handleClick } >{ this.props.translations.link.downloadDataSheet }</a></li>
                        <li><a href={ `${ Constants.URL_ENV }/en/${ this.props.product.generic }#product-documentation` } target="_blank" onClick={ this.handleClick } >{ this.props.translations.link.viewDocumentation }</a></li>
                        <li><a href={ `${ Constants.URL_ENV }/en/${ this.props.product.generic }#product-samplebuy` } target="_blank" onClick={ this.handleClick }  dangerouslySetInnerHTML={{ __html: this.props.translations.link.sampleAndBuy }} /></li>
                    </ul>
                </div>
                <div className="col-md-6 image">
                    <div><img src={ this.props.product.image } className="img-responsive" alt={ `${ this.props.product.name } diagram` } /></div>
                </div>
            </div>
        );
    }

}


function mapStateToProps( state ) {
    return {
        product: state.app.hoverProduct,
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ hoverProduct, dtmEvent }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( PopOver );