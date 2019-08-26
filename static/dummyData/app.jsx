import React, {Component} from 'react';

import UserWrapper from './containers/UserWrapper';
import NameContext from './context';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    user: [{fname: 'fred', lname: 'flintstone'}],
    isAuthenticated: false
    }
  }  
  
  changeUserHandler () {

    this.setState({name: 'Devon', isAuthenticated: true})
  }
  componentDidMount() {
    fetch('/someapi')
    .then(data => data.json())
    .then(data => console.log(data))
  }
  
  componentDidUpdate(prevprops, prevstate) {


  }
  
  componentWillUnmount() {

  }
  render() {
    return (

      <NameContext.Consumer value = {this.state.user}>
        <div>
          Hello World
        </div>
      <UserWrapper user = {this.state.user} isAuthenticated = {this.state.isAuthenticated}></UserWrapper>
      </NameContext.Consumer>
      );
  }
}
 
export default App;