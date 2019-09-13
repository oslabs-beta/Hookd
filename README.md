# Hookd
A cli tool for converting React class components to functional components with hooks.

We have two NPM modules for usage:

[@reactionaries/hookd](https://github.com/oslabs-beta/Hookd/tree/master/packages/hookd) is our module

[@reactionaries/hookd-cli](https://github.com/oslabs-beta/Hookd/tree/master/packages/hookd-cli) is our cli tool

Hookd will create a `/hookd` directory with your newly converted file
## Babel
Babel will be the main tool for parsing traversal and generating your new code.
## Resources
### Babel Packages
  - [babel parser](https://babeljs.io/docs/en/babel-parser)
    - parse existing code into an ast
  - [babel traverse](https://babeljs.io/docs/en/babel-traverse)
    - traversal and manipulation of the ast
  - [babel types](https://babeljs.io/docs/en/babel-types)
    - define and verify the state and creation of nodes
  - [babel generator](https://babeljs.io/docs/en/babel-generator)
    - creation of final ast code
### The Babel Handbook
  - [jamiebuilds' babel handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) fundamentals for creating babel plugins
### AST Explorer
  - [AST Explorer](https://astexplorer.net/) receives a special thanks

## Alpha Release
Hookd is a transpilation and transformation tool for React projects looking to slowly convert their projects into functional components with hooks.
Currently hookd only supports the major 3 hooks: useState, useEffect, useContext. Since the transfer of class component syntax to functional component syntax is not a direct one to one relationship, hookd transforms syntax nodes and tries to make assumptions about the logic of your application and build a new file based off those assumptions.
Due to our early release, the tool should primarily be used as a templating tool to create files that you can later build upon rather than an immediate replacement for all your class components.

### useState
- useState makes assumptions about `this.setState(cb)` where cb will `return` an object literal.  It does not keep track of _any_ variables and thus should be accounted for during transformation. If the `cb` were to return something else besides an object literal, it will break.
- `this.setState(() => {})` and `this.setState(function(){})` will work fine but `this.setState(() => ())` will break. The code assumes the body of the `ArrowFunctionExpression` will be a `BlockStatement`.
- More syntaxes to account for that we have not thought about

### useEffect
useEffect syntax in particular makes assumptions about stateful references within componentDidMount, componentDidUpdate, and componentWillUnmount to build one or multiple useEffect hooks.  Additionally hookd will try to find stateful references within the body of any non-life cycle method handlers and look again for those handlers within the life cycle methods.
Hookd will then build up each hook with a callback, return statement, and dependency array depending on the case that it requires.  useEffect accomplishes this by building a state dependency tree of all stateful references, the lifecycle method they were called in and whether a setState call was invoked.  While these factors should determine most use cases for useEffect they are hardly all encompassing. As this is an alpha release we hope to increase the amount of edge cases it accounts for. 

### useContext
The useContext logic parses through the AST looking for indicators that Context API functions have been utlized, it then generates useContext cases based upon the values assiciated with those indicators. JSX context.consumer tags will be removed in the next update.
