import React, { Component } from 'react';

class UEwCWU extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  componentDidMount() {
    document.title = this.state.bookName;
  }

  componentDidUpdate() {
    console.log(this.state.isAuthenticated);
  }
  
  componentWillUnmount() {
    clearInterval(this.state.interval);
  }
  render(){
    return (
      <div></div>
    );
  }
}