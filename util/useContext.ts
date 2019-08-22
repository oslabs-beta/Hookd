import * as parserMethods from './parser';
const fs: any = require('fs');
const path: any = require('path');

const file: string = fs.readFileSync(path.resolve((__dirname as string), '../static/dummyData/app.jsx')).toString();
// console.log(file);
const ast: object = parserMethods.parse(file); 
// console.log('pre ast is', ast);
// create functions in here and export in object


interface Node {
  type: string;
  name: string;
  Identifier: any;
  body: {body: any []};
}

interface Path {
  node: Node;
  traverse: ({}) => any;
  replaceWithMultiple: ([]:any) => any;
  replaceWith: (newNode: any) => any;
  findParent: (callback: (path: Path) => any) => any;
  isImportSpecifier: () => any;
  get: (type: string) => any;
}

// const changeNameContext = ( oldContext: string, newContext: string): void => { 
//   parserMethods.traverse(ast, {
//     enter(path) {
//       if ( path.node.type === "Identifier" && path.node.name === oldContext ) {
//         path.node.name = newContext;
//       }
//     }
//   }
// )};

​
const ImpSpecVisitor: {ImportSpecifier: (path: Path) => void} ={
  // method for traversing through all the ImportSpecifiers
  ImportSpecifier(path: Path): void {
    // check to see if the property 'imported' is an identifier with the name 'Component'
    if (path.get('imported').isIdentifier({name: 'Component'})) {
      // console.log(path.node);
      // replace the current path (importSpecifier) with multiple new importSpcefiers
      path.replaceWithMultiple([
        parserMethods.t.importSpecifier(parserMethods.t.identifier('useState'), parserMethods.t.identifier('useState')),
        parserMethods.t.importSpecifier(parserMethods.t.identifier('useEffect'), parserMethods.t.identifier('useEffect')),
        parserMethods.t.importSpecifier(parserMethods.t.identifier('useContext'), parserMethods.t.identifier('useContext')),
      ]);
    }
    // console.log('path.node is ', path.node);
  }
}



const ClassDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
  ClassDeclaration(path: Path): void {
    const hasProps: boolean = false;

      //traverse to constructor(props) to see if props exist, if so flip the hasProps boolean to true
    if(path.get('params').isIdentifier({name: "props"})) { !hasProps };
    
    if(path.get('id').isIdentifier({ name: "App"})){
      const blockStatement = path.node.body.body;
      console.log('blockStatement is', blockStatement)
      const props: any [] = hasProps ? [parserMethods.t.identifier("props")] : [];
      //Delete Experiment
      //NEED VISITORS TO 
      path.replaceWith(
        parserMethods.t.variableDeclaration("const", 
        [parserMethods.t.variableDeclarator(
          parserMethods.t.identifier("App"), 
          parserMethods.t.arrowFunctionExpression(props, parserMethods.t.blockStatement(blockStatement) ) 
          )
         ])
      )
    }  
  }
}


​
// const classDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
// ClassDeclaration(path: Path): void {
//   if (path.get('type').isClassDeclaration())
// }
​
// }
// the main method to traverse the ast
parserMethods.traverse(ast, {
  // specify an entry method to traverse downward
  enter(path: any) {
    // traverse through our visitor that we defined above
    path.traverse(ImpSpecVisitor);
    path.traverse(ClassDeclarationVisitor);
  }
})
// console.log(parserMethods.generate);

const updatedAST = parserMethods.generate(ast as any);
fs.writeFileSync('ast.jsx', updatedAST.code as string);

// console.log('post ast is ', ast)


export {}





