import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toggleColumn, sendColumnToFront, addStep } from '../../actions/ActionTypes';

import './style.css';

import QuickLink from './QuickLink';
import Compare from './Compare';

import Status from '../../img/QuickLinks/icon-toggle-status.png';
import Description from '../../img/QuickLinks/icon-toggle-description.png';
//import Tools from '../../img/QuickLinks/icon-toggle-tools.png';
import Hardware from '../../img/QuickLinks/icon-toggle-hardware.png';

class QuickLinks extends React.Component {

    constructor( props ){
        super( props );
        this.state = {
            minimized: props.minimized
        };
        this.links = [
            {
                name: 'Description', 
                column: 's6',
                image: Description 
            },
            /*
                // hiding until we get a better definition of what available should be 
                {
                    name: 'Tools', 
                    column: undefined,
                    image: Tools 
                },
            */
            {
                name: 'Hardware', 
                column: 's8',
                image: Hardware 
            },
            {
                name: 'Status', 
                column: 's7',
                image: Status 
            }
        ];
    }

    componentDidMount(){
        this.props.addStep([{
            title: 'One Click View',
            text: 'Toggle Description, Hardware and Status column views with one click. ',
            selector: 'div#columns > form .quick-links a.link:first-child',
            position: 'right',
            isFixed: true
        },
        {
            title: 'Compare Parts',
            text: 'View only selected parts in row format and isolate parts for a clean Excel Download.',
            selector: 'div#columns > form div.compare',
            position: 'bottom',
            isFixed: true
        }]);
    }

    shouldComponentUpdate( nextProps ){
        return ( nextProps.minimized !== this.props.minimized );
    }

    componentWillReceiveProps( nextProps ){
        this.setState({ minimized: nextProps.minimized });
    }

    render(){

        let classList = [ 'quick-links' ];

        if( this.state.minimized ) classList.push( 'minimized' );

        return (
            <div className={ classList.join( ' ' ) }>
                { 
                    this.links.map( ( link, index ) => <QuickLink column={ link.column } key={ index } onClick={ e => {
                        this.props.toggleColumn( link.column );
                        this.props.sendColumnToFront( link.column );
                    }
                } icon={ link.image } title={ `Toggle ${ link.name } Column` } /> )}
                <Compare />
            </div>
        );
    }

}

function mapStateToProps( state ) {
    return {
        minimized: state.app.minimized
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ toggleColumn, sendColumnToFront, addStep }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( QuickLinks );
