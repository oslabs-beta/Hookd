import React, { Component } from 'react';

class UEwCDM1 extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  componentDidMount() {
    document.title = this.state.bookName;
  }
  
  render(){
    return (
      <div></div>
    );
  }
}

