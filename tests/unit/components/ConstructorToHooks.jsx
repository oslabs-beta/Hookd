import React, {Component} from 'react';

class Test1 extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return <div></div>
  }
}

class Test2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      prop: 'properties',
      obj: {
        this: 'exists'
      },
      arr: [
        {
          num: 1337,
          wow: "I'm cool"
        }
      ]
    }
  }
  render(){
    return (
    <div>
      {this.state.prop};
    </div>
    )
  }
}

/**
 * uncomment when class properties have been accounted for
 */
// class Test3 extends React.Component {
//   state = {
//     short: 'syntax for constructor'
//   }
// }