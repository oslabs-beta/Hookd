import React, {Component} from 'react';
import UserWrapper from './containers/UserWrapper';
import NameContext from './context';

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
    document.title = `You clicked ${this.state.count} times`;
    // function changeUserHandler(a, b) {
    //   console.log(this.state.count);
    // }
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentDidUpdate() {
    document.title = `You clicked ${this.state.count} times`;
    changeUserHandler();
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  render() {
    return (
      <NameContext.Provider value = {this.state.user}>
        <div>
          Hello World
        </div>
      <UserWrapper user = {this.state.user} isAuthenticated = {this.state.isAuthenticated}></UserWrapper>
      </NameContext.Provider>
      );
  }
}
 
export default App;