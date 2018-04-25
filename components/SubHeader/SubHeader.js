import React from 'react';
import { IE11 } from '../../constants';
import './style.css';

const SubHeader = props => {

    let classes = [ 'sub-header' ];

    if( IE11 ) classes.push( 'ie11' );

    return (
        <div className={ classes.join( ' ' ) }>
            <h1>{ props.title }</h1>
        </div>
    );
}

export default SubHeader;