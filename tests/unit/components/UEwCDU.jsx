import React, { Component } from 'react';

class UEwCDU extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  componentDidMount() {
    document.title = this.state.bookName;
    console.log(this.state.isAuthenticated);
  }

  componentDidUpdate() {
    console.log(this.state.isAuthenticated);
  }
  
  render(){
    return (
      <div></div>
    );
  }
}