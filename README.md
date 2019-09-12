# Hookd
A cli tool for converting React class components to functional components with hooks.
- To use as a global tool:
  - Clone the repo
  - `[sudo] npm link`
  - `[sudo] hookd <filePath>`
- To use as a npm cl tool:
  - `npm i -D @reactionaries/hookd`
  - create a `package.json` script for hookd

Then Hookd will create a `/hookd` directory with your newly converted file
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