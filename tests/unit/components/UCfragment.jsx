import React, {Component} from 'react';
import UserWrapper from './containers/UserWrapper';
import NameContext from './context';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    user: [{fname: 'fred', lname: 'flintstone'}],
    isAuthenticated: false
    }
  }
  

  render() {
    return (
      <NameContext.Consumer>
        <div>
          {(value) =>  <div>{value} </div> }
      	<p>first name: {this.state.user[0].fName}</p>
        </div>
      <UserWrapper user = {this.state.user} isAuthenticated = {this.state.isAuthenticated}></UserWrapper>
      </NameContext.Consumer>
      );
  }
}

export default App;