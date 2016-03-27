import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import configureStore from './store/configureStore';
import './styles/styles.scss';

const store = configureStore();

render(
    <Provider store={store}>
        <Router history={browserHistory} routes={routes}/>
    </Provider>, document.getElementById('app')
);

// Nothing special for now
// HACK(DanPantry): It appears that export default const = is illegal syntax?
// Why are we exporting a component from here anyway? ^^
const App = () => <div></div>;
export default App;
