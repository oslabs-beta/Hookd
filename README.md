# Hookd
A cli tool and visualizer for converting React class components to functional components with hooks.

## Babel
Babel will be the main tool for parsing traversal and manipulation.

### Babel Packages
  - [babel parser](https://babeljs.io/docs/en/babel-parser)
    - this will parse existing code into an ast
  - [babel traverse](https://babeljs.io/docs/en/babel-traverse)
    - this will help in the traversal, manipulation of the ast
  - [babel types](https://babeljs.io/docs/en/babel-types)
    - this will help define, verify, the state generation of nodes
  - [babel generator](https://babeljs.io/docs/en/babel-generator)
  
### The Babel Handbook
  - [jamiebuilds' babel handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) on babel plugins
