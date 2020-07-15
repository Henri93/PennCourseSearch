import React from "react";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';
import Search from './Search';

export default class App extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="App" style={{backgroundColor: "#1b1b2f"}}>
				<Router>
					<Switch>
						<Route exact path='/' component={Search} />
						<Route exact path='*' component={Search} />
					</Switch>
				</Router>
			</div>
		);
	}
}