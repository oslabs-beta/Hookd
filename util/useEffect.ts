// create functions here and export it in object
import {parse,traverse,t,generate} from './parser';
import {Path, stateDep} from './constants/interfaces';
import {createUseEffect, createFunctionDefinitions, checkKeyIdentifier} from './helperfunctions';
import * as names from './constants/names';
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
        t.importSpecifier(t.identifier(names.US), t.identifier(names.US)),
        t.importSpecifier(t.identifier(names.UE), t.identifier(names.UE)),
        t.importSpecifier(t.identifier(names.UC), t.identifier(names.UC)),
      ]);
    }
    // console.log(path.node);
  }
}
// const memberExpressionVisitor: {MemberExpression: (path: Path)=> void} = {
//   MemberExpression(path: Path): void {
//     if (path.get('setState').isIdentifier('setState')) {
//       path.parentPath.arguments.forEach()
//     }
    
//   }
// }
const classDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
ClassDeclaration(path: Path): void {
  // keep track of all handlerfunctions and create a visitor for function body
  // keep track of body ([])
  const stateDependencies: stateDep = {};
  let body: any[] = [];
  // opts: lcm, returnFunction, stateToCheck []
  const opts: {lcm?: string, returnFunction?: any,stateToCheck?: any []} = {};
  // keep track of all methodNames that a piece of state is being references within the scope of that method
  // call createUseEffect() here 
  path.traverse({
    ClassMethod(path: Path): void {
      let currMethodName = path.node.key.name;
      const cdm = checkKeyIdentifier(names.CDM, path),
      cdu = checkKeyIdentifier(names.CDU, path),
      cwu = checkKeyIdentifier(names.CWU, path),
      render = checkKeyIdentifier(names.R, path);
      // traverse through all expression statements and function declarations within a classMethod
      path.traverse({
        ExpressionStatement(path: Path): void {
          const expressionStatement: any = path.node;
          path.traverse({
            MemberExpression(path: Path): void {
              const stateName: string = path.parentPath.node.property ? path.parentPath.node.property.name : null;
              if (t.isIdentifier(path.node.property, {name: 'state'}) && stateName) {
                const stateNameObj = {
                  [currMethodName]: {
                    expressionStatement: {
                      node: expressionStatement
                    }
                  }
                };
                const methodNameObj =  {
                  expressionStatement: {
                    node: expressionStatement
                  }
                }
                if (stateDependencies.hasOwnProperty(stateName))
                  if (stateDependencies[stateName].hasOwnProperty(currMethodName)) stateDependencies[stateName][currMethodName].expressionStatement.node = expressionStatement;
                  else {
                    stateDependencies[stateName][currMethodName] = methodNameObj;
                  }
                else {
                    stateDependencies[stateName] = stateNameObj;
               } 
                console.log('statename: ', stateDependencies)
                }
              }
          })
        }
      })
      // find all functionDeclarations that relate to a piece of state
      // work on this once Expression Statement without the scope of Function Declaration works
      // path.traverse({
      //   FunctionDeclaration(path: Path):void {
      //     path.traverse({
      //       ExpressionStatement(path: Path): void {
      //         const expressionStatement: any = path.node;
      //         path.traverse({
      //           MemberExpression(path: Path): void {
      //             const stateName: string|null = path.parentPath.node.property ? path.parentPath.node.property.name : null;
      //             if (t.isIdentifier(path.node.property, {name: 'state'}) && stateName) {
      //                 stateDependencies[stateName] = {
      //                   stateName, 
      //                   methodNames: [currMethodName], 
      //                   nodes: expressionStatement};
      //               }
      //             }
      //         })
      //       }
      //     })
      //     // console.log('statename: ', stateDependencies)

      //   }
      // })
      if (!cdm && !cdu && !cwu && !render) {
        let name: string = path.node.key.name ? path.node.key.name : '';
        let paramNames: any[] = path.node.params;
        let body: any[] = path.node.body.body;
        path.replaceWith(createFunctionDefinitions(name, paramNames, body))
      }
      if(cdm) {
        body = body.concat(path.node.body.body);
        opts.lcm = names.CDM;
        console.log('in CDM')
        path.remove();
      }
      if(cdu) {
        opts.lcm = names.CDU;
        body = body.concat(path.node.body.body);
        console.log('in componentDidUpdate')
        path.remove();
        //check for state here
      }
      if(cwu) {
        opts.returnFunction = path.node.body.body;
        opts.lcm = names.CWU;
        console.log('in componentWillUnmount');
        path.remove();
      }
      if(render) {
        path.replaceWith(path.node.body.body[0]);
      }
   }
  })
  // need to change position of useEffect so it's after state declarations
  path.get('body').unshiftContainer('body', createUseEffect(body, opts))

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