import React from 'react';
import Modal from 'react-bootstrap-modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { handleModal, displayColumns, modifyFilter } from '../../actions/ActionTypes';
import './style.css';

class Parameters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.show,
            categories: [],
            selections: []
        };
        this.checkboxes = [];
        //this.categoryElems = []; -- Removed as headerElems and labelElems is used to calculate height and width
        this.headerElems = [];
        this.labelElems = [];
    }

    componentWillReceiveProps(nextProps) {

        this.checkboxes = []; // reset checkboxes
        //this.categoryElems = []; -- Removed as headerElems and labelElems is used to calculate height and width
        this.headerElems = [];
        this.labelElems = [];

        let selections = [];
        for (let field in this.props.showStateArray) selections.push({ field, display: nextProps.showStateArray[field] });

        if (this.props.show !== nextProps.show) this.setState({ open: nextProps.show });

        this.setState({ selections });

        if (this.state.categories.length > 0) return; // no use doing this more than once

        // get column categories
        let categories = nextProps.columns
            .filter(column => column.field !== '0') // remove the column that has none
            .map(column => nextProps.parameters[column.field].classification) //get category name
            .filter((category, index, array) => index === array.indexOf(category)) // dedupe categories
            .sort()
            .map(category => { return { name: category, children: [] } }); // turn it into an object

        // assign columns to categories
        nextProps.columns.forEach( column => {
            if (!nextProps.parameters[column.field]) return;
            let category = categories.find(category => category.name === nextProps.parameters[column.field].classification),
                tempColumn = { ...column };
            tempColumn.definition = nextProps.parameters[column.field].definition;
            category.children.push(tempColumn);
        });

        this.setState({ categories }); // set categories to state to avoid doing the above everytime the parameters button is clicked
    }

    componentDidUpdate() {
        if (this.headerElems.length === 0 && this.labelElems.length === 0) return;
        let header = this.headerElems.length * (Math.max(...this.headerElems.map(elem => elem.offsetHeight)) + 20); // 20 - Margin of the header element
        let label = this.labelElems.length * (Math.max(...this.labelElems.map(elem => elem.offsetHeight)) + 5); // 5 - Margin of the label element
        this.refs.ModalDialog.refs.inner.style.width = (Math.ceil((header + label) / 350) * 215) + 'px'; // 350 - Container Height
        this.refs.ModalDialog.refs.inner.style.minWidth = '645px';
    }

    applyChanges = e => {

        e.preventDefault();

        let selections = this.checkboxes.map(checkbox => {
            return { field: checkbox.value, display: checkbox.checked };
        }),
        fields = selections.filter(selection => selection.display).map(selection => selection.field);

        this.setState({
            selections,
            open: false
        });

        this.props.displayColumns( selections );
        this.props.handleModal(this.props.showModal);
        this.props.modifyFilter(undefined, this.props.filter, 'd', true, fields);
    }

    closeModal = () => {
        this.props.handleModal(this.props.showModal);
        this.setState({ open: false });
    }

    renderParameters() {
        if (!this.state.categories) return null;
        return (
            <div className="row parameters" ref="container">
                {this.state.categories.map(this.renderCategory)}
            </div>
        );
    }

    renderCategory = (category, index) => {
        return (
            [
				<h4 ref={elem => this.headerElems.push(elem)} key={`category-${index}`}>{category.name}</h4>,
                category.children.map(this.renderColumn)
            ]
        );
    }

    renderColumn = (column, index) => {
        return (
            <label ref={elem => this.labelElems.push(elem)} key={`category-column-${index}`}>
                <input
                    type="checkbox"
                    name="columns"
                    ref={
                        elem => {
                            if (!elem) return;
                            this.checkboxes.push(elem);
                            let state = this.state.selections.find(selection => selection.field === elem.value);
                            elem.checked = state.display;
                        }
                    }
                    value={column.field} />
                &nbsp;{column.definition}
            </label>
        );
    }

    selectBulk = state => {
        this.checkboxes.forEach(checkbox => checkbox.checked = state);
    }

    default = e => {
        let defaults = this.props.columns.filter(column => column.display_in_default_view === 'true').map(column => column.field);
        this.checkboxes.forEach(checkbox => checkbox.checked = (defaults.indexOf(checkbox.value) > -1));
    }

    render() {

        return (
            <Modal
                ref="ModalDialog"
                show={this.state.open}
                onHide={this.closeModal}
                aria-labelledby="ModalHeader"
                className="modal-pst">
                <Modal.Header className="ui-dialog-titlebar" closeButton>
                    <Modal.Title id='ModalHeader'>{ this.props.translations.button.parameters.choose }</Modal.Title>
                </Modal.Header>
                <div className="modal-pst-content">
                <Modal.Body>
                    <div className="row h-bar-border-bottom">
                        <div className="col-md-12 h-bar-popup-button">
                            <span className="h-bar-button pull-right">
                                <a className="h-bar-border-radius" href="#" onClick={this.default}>{ this.props.translations.button.default }</a>
                            </span>
                            <span className="h-bar-button pull-right">
                                <a className="h-bar-border-radius" href="#" onClick={() => this.selectBulk(false)}>{ this.props.translations.button.deselectAll }</a>
                            </span>
                            <span className="h-bar-button pull-right">
                                <a className="h-bar-border-radius" href="#" onClick={() => this.selectBulk(true)}>{ this.props.translations.button.selectAll}</a>
                            </span>
                        </div>
                    </div>
                    {this.renderParameters()}
                </Modal.Body>
                <Modal.Footer>
                    <div className="row">
                        <div className="col-md-12">
                            <span className="h-bar-button">
                                <a className="h-bar-border-radius" href="#" onClick={ this.applyChanges }>
                                { this.props.translations.button.ok }
                                </a>
                            </span>
                            <Modal.Dismiss className='btn btn-default'>{ this.props.translations.button.cancel }</Modal.Dismiss>
                        </div>
                    </div>
                </Modal.Footer>
                </div>
            </Modal>
        )
    };
}

function mapStateToProps(state) {
    return {
        parameters: state.app.parameters,
        columns: state.app.columns,
        showModal: state.app.showModal,
        showStateArray: state.app.showStateArray,
        filter: state.app.filter,
        translations: state.app.translations
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ handleModal, displayColumns, modifyFilter }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Parameters);
