import React from 'react';
import { connect } from 'react-redux';

import './style.css';

/**
 * As of 22 March 2018, for the time being we're displaying all notes all of the time.
 * Conditionally, `pricing.unavailable` should only show up when there is a row that has
 * no pricing data (i.e. `**`)
 */
const Notes = props => {
    return(
        <section className="pstNote pst notes">
            <p dangerouslySetInnerHTML={{ __html: props.translations.footnote.pricing.disclosure }} />
            <p dangerouslySetInnerHTML={{ __html: props.translations.footnote.pricing.evaluationBoardsAndKits }} />
            <p dangerouslySetInnerHTML={{ __html: props.translations.footnote.pricing.unavailable }} />
        </section>
    );
}

function mapStateToProps( state ) {
    return {
        translations: state.app.translations
    };
}

export default connect( mapStateToProps )( Notes );