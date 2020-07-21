import {React} from "react";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Search} from './Search';

export default class App extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="App">
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