import React, { useState, useEffect, useContext } from 'react';
import UserWrapper from './containers/UserWrapper.jsx';
import NameContext from './context.js';

class App extends Component {
  const importedNameContext = useContext(NameContext);

  constructor(props) {
    super(props);
    this.state = {
      user: [{
        fname: 'fred',
        lname: 'flintstone'
      }],
      isAuthenticated: false
    };
  }

  changeUserHandler() {
    this.setState({
      name: 'Devon',
      isAuthenticated: true
    });
  }

  componentDidMount() {}

  componentDidUpdate(prevprops, prevstate) {}

  componentWillUnmount() {}

  render() {
    return <NameContext.Consumer value={this.state.user}>
        <div>
          Hello World
        </div>
      <UserWrapper user={this.state.user} isAuthenticated={this.state.isAuthenticated}></UserWrapper>
      </NameContext.Consumer>;
  }

}

export default App;