import React, {Component} from 'react';

class Test1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      prop: 'this is ideation week'
    }
    this.handler = this.handler1.bind(this);
  }

  handler(){
    this.setState({
      prop: 'this is another idea'
    })
  }

  render() {
    return (
      <div onClick={this.handler}>
        {this.state.prop}
      </div>
    )
  }
}

/**
 * uncomment if accounting for this.setState callback argument
 */
// class Test2 extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       ohno: 'this is not accounted for'
//     }
//     this.handler = this.handler.bind(this);
//   }

//   handler(){
//     this.setState(() => {
//       const str = 'because this is another edge case out of many';
//       return { ohno: str};
//     })
//   }

//   render() {
//     return (
//       <div>
//         {this.state.ohno}
//       </div>
//     )
//   }
// }

// class Test3 extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       holy: 'cow'
//     }
//     this.handler = this.handler.bind(this);
//   }

//   handler(){
//     this.setState(() => {
//       const str = 'because this is another edge case out of many';
//       return { ohno: str};
//     })
//   }

//   render() {
//     return (
//       <div>
//         {this.state.ohno}
//       </div>
//     )
//   }
// }