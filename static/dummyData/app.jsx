import React, {Component} from 'react';
import UserWrapper from './containers/UserWrapper.jsx.js';
import NameContext from './context.js.js';

//[user, setUser] = useState([]);
//const App = (props) => {}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    user: [{fname: 'fred', lname: 'flintstone'}],
    isAuthenticated: false
    }
  }
  
  changeUserHandler () {
	//setUser([{name:  'Devon'}])
    this.setState({name: 'Devon', isAuthenticated: true})
  }
  componentDidMount() {
   //fetch to swapi 
  }
  
  componentDidUpdate(prevprops, prevstate) {
	//check if prevprops or prevstate has changed
    //if it does then call the fetch method
  }
  
  componentWillUnmount() {
	//unsubscribe from fetch polling or other subscription api
  }
  render() {
    return (
      <NameContext.Provider value = {this.state.user}>
        <div>
          Hello World
        </div>
      <UserWrapper user = {this.state.user} isAuthenticatd = {this.state.isAuthenticated}></UserWrapper>
      </NameContext.Provider>
      );
  }
}
 
export default App;