import React, { useState, useEffect, useContext } from 'react';
import UserWrapper from './containers/UserWrapper';
import NameContext from './context'; //[user, setUser] = useState([]);
//const App = (props) => {}

class App extends Component {
  useEffect(() => {
    document.title = `You clicked ${this.state.count} times`; // function changeUserHandler(a, b) {
    //   console.log(this.state.count);
    // }

    ChatAPI.subscribeToFriendStatus(this.props.friend.id, this.handleStatusChange);
    document.title = `You clicked ${this.state.count} times`;
    changeUserHandler();
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(this.props.friend.id, this.handleStatusChange);
    };
  });

  function constructor(props) {
    super(props);
    this.state = {
      user: [{
        fname: 'fred',
        lname: 'flintstone'
      }],
      isAuthenticated: false
    };
  }

  function changeUserHandler() {
    //setUser([{name:  'Devon'}])
    this.setState({
      name: 'Devon',
      isAuthenticated: true
    });
  }

  return <NameContext.Provider value={this.state.user}>
        <div>
          Hello World
        </div>
      <UserWrapper user={this.state.user} isAuthenticated={this.state.isAuthenticated}></UserWrapper>
      </NameContext.Provider>;
}

export default App;