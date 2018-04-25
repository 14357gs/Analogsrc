import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { handleCompare } from '../../actions/ActionTypes';


class Compare extends React.Component {

    constructor( props ){
        super( props );
        this.state = {
            viable: props.selectedRows.filter( row => row.selected ).length > 1
        };
    }

    componentWillReceiveProps( nextProps ){
        this.setState({ viable: nextProps.selectedRows.filter( row => row.selected ).length > 1 });
    }

    render(){
        return (
            <div className="compare">
                <hr />
                <button 
                    className={ this.state.viable ? 'active' : '' } 
                    disabled={ !this.state.viable }
                    onClick={ 
                        e => {
                            e.preventDefault();
                            this.props.handleCompare( this.props.compareState );
                        }
                    }>
                    { this.props.translations.button[ this.props.compareState ? 'showAll' : 'compare' ] }
                </button>
            </div>
        );
    }

}

function mapStateToProps( state ) {
    return {
        compareState: state.app.compareState,
        selectedRows: state.app.selectedRows,
        translations: state.app.translations
    };
}

function mapDispatchToProps( dispatch ){
    return bindActionCreators({ handleCompare }, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( Compare );
