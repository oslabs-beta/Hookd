// create functions here and export it in object
import {parse,traverse,t,generate} from './parser';
import {Path, stateDep, handlers} from './constants/interfaces';
import {createUseEffect, createFunctionDefinitions, checkKeyIdentifier, parseStateDep, checkIfHandler} from './helperfunctions';
import * as n from './constants/names';
const fs: any = require('fs');
const path: any = require('path');


const file: string = fs.readFileSync(path.resolve((__dirname as string), '../static/dummyData/app.jsx')).toString();
console.log(file);
const ast: object = parse(file); 
const ImpSpecVisitor: {ImportSpecifier: (path: Path)=> void} ={
  // method for traversing through all the ImportSpecifiers
  ImportSpecifier(path: Path): void {
    // check to see if the property 'imported' is an identifier with the name 'Component'
    if (path.get('imported').isIdentifier({name: 'Component'})) {
      // console.log(path.node);
      // replace the current path (importSpecifier) with multiple new importSpcefiers
      path.replaceWithMultiple([
        t.importSpecifier(t.identifier(n.US), t.identifier(n.US)),
        t.importSpecifier(t.identifier(n.UE), t.identifier(n.UE)),
        t.importSpecifier(t.identifier(n.UC), t.identifier(n.UC)),
      ]);
    }
    // console.log(path.node);
  }
}
const classDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
ClassDeclaration(path: Path): void {
  // keep track of all handlerfunctions and create a visitor for function body
  // keep track of body ([])
  let body: any[] = [];
  // opts: lcm, returnFunction, stateToCheck []
  const opts: {lcm?: string, returnFunction?: any,stateToCheck?: any []} = {};
  // keep track of all methodNames that a piece of state is being references within the scope of that method
  const handlers: handlers[] = [];
  const stateDependencies: stateDep = {};
  path.traverse({
    ClassMethod(path: Path): void {
      let currMethodName = path.node.key.name;
      const cdm = checkKeyIdentifier(n.CDM, path),
      cdu = checkKeyIdentifier(n.CDU, path),
      cwu = checkKeyIdentifier(n.CWU, path),
      render = checkKeyIdentifier(n.R, path),
      constructor = checkKeyIdentifier(n.C, path);
      // traverse through all expression statements and function declarations within a classMethod
      path.traverse({
        ExpressionStatement(path: Path): void {
          const expressionStatement: any = path.node;
          path.traverse({
            MemberExpression(path: Path): void {
              const stateName: string = path.parentPath.node.property ? path.parentPath.node.property.name : null;
              if (t.isIdentifier(path.node.property, {name: 'state'}) && stateName) {
                let lcmsArr;
                const lcmsObj = {name: currMethodName, expressionStatement: {node: expressionStatement, setsState: false}};
                let isHandler = checkIfHandler(currMethodName);
                // if the currMethodName is not a handler then create the lcmsObject
                // console.log('is handler: ', isHandler, ' current method name: ', currMethodName);
                // console.log('lcmsObj: ', lcmsObj)
                if (!isHandler) lcmsArr = [lcmsObj]
                // if the state property is defined then we can update the individual properties
                if(stateDependencies[stateName]) {
                  // console.log('stateDeps: ', stateDependencies);
                  // if lcmsArr exists then we know the current method is not a handler
                  // if there is already an lcms array then we push the new lcmsObj onto it
                  if (lcmsArr && stateDependencies[stateName].lcms) stateDependencies[stateName].lcms.push(lcmsObj)
                  // if there stateDep obj doesn't have a lcmsArr then instantiate it
                  else if(lcmsArr) stateDependencies[stateName].lcms= lcmsArr;
                  // 
                  else stateDependencies[stateName].handlers = handlers;
                }
                // if the state property is not defined yet, we need to initialize it
                else {
                  // if lcmsObj is defined then set the lcms property to the lcms Obj
                  // console.log('lcmsArr:', lcmsArr);
                  if (!isHandler) stateDependencies[stateName] = {lcms: lcmsArr};
                  // if lcmsObj is undefined then we are in a handler, not a lcm
                  else stateDependencies[stateName] = {handlers}; 
                }
                }
              }
          })
        }
      })
      if (!cdm && !cdu && !cwu && !render && !constructor) {
        let name: string = path.node.key.name ? path.node.key.name : '';
        let paramNames: any[] = path.node.params;
        let body: any[] = path.node.body.body;
        // console.log(path.node);
        path.replaceWith(createFunctionDefinitions(name, paramNames, body));
        handlers.push({node: path.node, name, setsState: false});
      }
      if(cdm) {
        body = body.concat(path.node.body.body);
        opts.lcm = n.CDM;
        console.log('in CDM')
        path.remove();
      }
      if(cdu) {
        opts.lcm = n.CDU;
        body = body.concat(path.node.body.body);
        console.log('in componentDidUpdate')
        path.remove();
        //check for state here
      }
      if(cwu) {
        opts.returnFunction = path.node.body.body;
        opts.lcm = n.CWU;
        console.log('in componentWillUnmount');
        path.remove();
      }
      if(render) {
        path.replaceWith(path.node.body.body[0]);
      }
   }
  })
  // need to change position of useEffect so it's after state declarations
  parseStateDep(stateDependencies).forEach(UE => {
    path.get('body').unshiftContainer('body', UE);
  })
    
}

}
// the main method to traverse the ast
traverse(ast, {
  // specify an entry method to traverse downward
  enter(path: any) {
    // traverse through our visitor that we defined above
    path.traverse(ImpSpecVisitor);
    path.traverse(classDeclarationVisitor);
  }
})
const newCode: string = generate(ast).code;
fs.writeFileSync('./static/dummyData/newFile.jsx', newCode as string)
export {}