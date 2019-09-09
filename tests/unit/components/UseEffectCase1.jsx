import React, { Component } from 'react';

class UseEffectCase1 extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  componentDidMount() {
    document.title = `Who wrote ${this.state.bookName}?`;
  }

  render(){
    return (
      <div></div>
    );
  }
}