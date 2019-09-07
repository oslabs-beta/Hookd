# Hookd
A cli tool for converting React class components to functional components with hooks.
- To use:
  - Clone the repo
  - `[sudo] npm link`
  - `[sudo] hookd <filePath>`
  - and Hookd will create a `/test` directory with your new file
## Babel
Babel will be the main tool for parsing traversal and generating you're new code.
## Resources
- ### Babel Packages
  - [babel parser](https://babeljs.io/docs/en/babel-parser)
    - parse existing code into an ast
  - [babel traverse](https://babeljs.io/docs/en/babel-traverse)
    - traversal and manipulation of the ast
  - [babel types](https://babeljs.io/docs/en/babel-types)
    - define and verify the state and creation of nodes
  - [babel generator](https://babeljs.io/docs/en/babel-generator)
    - creation of final ast code
  
- ### The Babel Handbook
  - [jamiebuilds' babel handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) fundamentals for creating babel plugins