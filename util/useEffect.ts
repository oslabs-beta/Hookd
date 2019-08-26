// create functions here and export it in object
import * as parserMethods from './parser';
import * as cue from './helperfunctions';
const fs: any = require('fs');
const path: any = require('path');


const file: string = fs.readFileSync(path.resolve((__dirname as string), '../static/dummyData/app.jsx')).toString();
console.log(file);
const ast: object = parserMethods.parse(file); 
// console.log(ast);
interface Node {
  type: string;
  name: string;
  Identifier: any;
  body: {body: any[]};
}
interface Path {
  node: Node;
  traverse: ({}) => any;
  replaceWithMultiple: ([]:any) => any;
  findParent: (callback: (path: Path) => any) => any;
  isImportSpecifier: () => any;
  get: (type: string) => any;
}

const ImpSpecVisitor: {ImportSpecifier: (path: Path)=> void} ={
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
    // console.log(path.node);
  }
}

const classDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
ClassDeclaration(path: Path): void {
  // keep track of body ([])
  // opts: lcm, returnFunction, stateToCheck []
  let body: any[];
  let opts: {lcm?: string, returnFunction?: any,stateToCheck?: any []} = {};
  path.traverse({
    ClassMethod(path: Path): void {
      // 
      if(path.get('key').isIdentifier({name: 'componentDidMount'})) {
        body = path.node.body.body;
        // console.log(body);
        opts.lcm = 'componentDidMount';
        console.log(cue.createUseEffect(body, opts))
      }
    }
  })
}

}
// the main method to traverse the ast
parserMethods.traverse(ast, {
  // specify an entry method to traverse downward
  enter(path: any) {
    // traverse through our visitor that we defined above
    path.traverse(ImpSpecVisitor);
    path.traverse(classDeclarationVisitor);
  }
})
export {}