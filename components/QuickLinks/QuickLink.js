import React from "react";
import { connect } from 'react-redux';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

class Link extends React.Component {

    constructor( props ){
        super( props );
        this.state = { active: false };
    }

    componentWillReceiveProps( nextProps ){
        this.setState({ active: nextProps.showStateArray[ nextProps.column ] });
    }

    handleClick = e => {
        e.preventDefault();
        this.props.onClick( e );
    }

    render(){
        const tooltip = (
            <Tooltip id="tooltip">
                { this.props.title }
            </Tooltip>
        );

        let classList = [ 'link' ];

        if( this.state.active ) classList.push( 'active' );

        return (
            <OverlayTrigger placement="right" overlay={tooltip}>
            <a href="#" className={ classList.join( ' ' ) } onClick={ this.handleClick }>
                <img src={ this.props.icon } alt={ this.props.title } />
            </a>
            </OverlayTrigger>
        );
    }
};

function mapStateToProps( state ) {
    return {
        showStateArray: state.app.showStateArray
    };
}

export default connect( mapStateToProps )( Link );