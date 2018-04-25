import React from 'react';
import { connect } from 'react-redux';

class PartsCount extends React.Component {

    constructor( props ){
        super( props );
        this.state = {
            count: props.count,
            text: props.text
        };
    }

    componentWillReceiveProps( nextProps ){
        this.setState({ count: nextProps.count });
    }

    render(){

        let count = ( this.props.compareState ) ? this.props.selectedRows.length : this.state.count;

        return (
            <h3 className="parts">{ count } { this.state.text }</h3>
        )
    }

}

function mapStateToProps( state ) {
    return {
        compareState: state.app.compareState,
        selectedRows: state.app.selectedRows
    };
}

export default connect( mapStateToProps )( PartsCount );
