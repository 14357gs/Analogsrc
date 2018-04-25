import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import ReduxThunk from 'redux-thunk';
import reducers from './reducers';
import adobeDtm from './middleware/adobe-dtm';
import App from './App';
import './index.css';


const enhancers = compose( 
    applyMiddleware( ...[ ReduxThunk, adobeDtm ]), window.devToolsExtension
	? window.devToolsExtension()
	: f => f);

const store = createStore(reducers, enhancers);

ReactDOM.render(
  	<Provider store={store}><App /></Provider>,
  document.getElementById('root')
);