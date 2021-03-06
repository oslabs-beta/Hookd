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
class Test2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ohno: 'this is not accounted for'
    }
    this.handler = this.handler.bind(this);
  }
  handler(){
    this.setState(() => {
      const str = 'because this is another edge case out of many';
      return { ohno: str };
    })
  }
  render() {
    return (
      <div>
        {this.state.ohno}
      </div>
    )
  }
}

class Test3 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      holy: 'cow',
      ohno: 'wow'
    }
    this.handler = this.handler.bind(this);
  }
  handler(){
    this.setState((prevProps) => {
      const str1 = prevProps.holy + ' because this is another edge case out of many';
      return { ohno: str1 };
    })
  }
  render() {
    return (
      <div>
        {this.state.ohno}
      </div>
    )
  }
}
// // Use Effect logic is not accounting for this right now but works with use state
// class Test4 extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       nice: 'job'
//     }
//     this.handler = this.handler.bind(this);
//   }
//   handler(){
//     this.setState((state) => ({ nice: state.nice + 's' }))
//   }
//   render() {
//     return (
//       <div>
//         {this.state.nice}
//       </div>
//     )
//   }
// }