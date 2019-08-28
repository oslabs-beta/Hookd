import * as parserMethods from './parser';
import { PassThrough } from 'stream';
import { type } from 'os';
import { ENETRESET } from 'constants';
const {parse,traverse,t,generate} = parserMethods;
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
  program: {program: any};
  local: {name: string};
  object: {name: string};
  specifiers: {name: string};
  property: {name: string};
  superClass: {name: string};
  operator: {body: any[]};
  declaration: any;
  params: {params: any []};
  arguments: {arguments: any []};
  key: {key: any []}
}

interface Path {
  node: Node;
  traverse: ({}) => any;
  replaceWithMultiple: ([]:any) => any;
  replaceWith: (newNode: any) => any;
  findParent: (callback: (path: Path) => any) => any;
  isImportSpecifier: () => any;
  get: (type: string) => any;
  insertAfter: (newNode: any) => any;
  insertBefore: (newNode: any) => any;
  isIdentifier:(type: boolean) => false;
  remove: () => void;
}


const DeclarationStore: string[] = [];

//create function to go through import statements and store in array, checking the Method Defenition 
const ImpDeclVisitor: {ImportDeclaration: (path: Path) => void} = { 
  ImportDeclaration(path: Path): void {
    // console.log('ImportDeclaration path is', path.node)
    // console.log('Pre-traversal, DeclarationStore is' , DeclarationStore);
    // console.log('inside the import declaration, pushing those values into DeclStoreArray to check against the context consumers')
    //go through import statements storing in DeclStore each identifier name['React','Component, UserWrapper, NameContext]

    // console.log('path.node is ', path.node);
    path.traverse({
      ImportDefaultSpecifier (path: Path): void {
        // console.log('inside path traversal of importDefaultSpecifier')
        // console.log('ImportDefaultSpecifier path is:', path.node)
        // let array = path.node.local;
        // let value = path.node.local.name;
        DeclarationStore.push(path.node.local.name);
        // console.log("DeclarationStore is", DeclarationStore )
        // console.log('is path.node.local an array?:', Array.isArray(path.node.local));
        // console.log('path.node.local looks like this:', path.node.local);
        // console.log('array looks like this', array);
        // console.log('value pulled from path.node.local is', value);
      }
    })
  }
}
   
//why doesn't this one work????
// const ProgramVisitor:  {Program: (path: Path) => void} = {
//   Program(path: Path): void {
//     console.log('we are at the program level')
//   }
// }


let contextToUse: string = '';
//contextCount is something we need during the process to build the const...useContext(context) statement.  
let contextCount: number = 0;
//ClassBody -> ClassMethod
const UseContextDecl: {ClassDeclaration: (path: Path) => void} = {
    //if DeclareStore includes path.get...path.get('JSXIdentifier').t.identifier({name})  //do the conversion
  ClassDeclaration(path: Path): void {
    // console.log('inside the use Context Declaration Builder Function')
    //traverse...
    path.traverse({
      JSXMemberExpression(path: Path): void {
        // console.log('inside the classMethod traversal stage')
        
        //might not be necessary to check the right side could juest check the left, it's just one more level of nesting
        //if right side of expression is "consumer"{
          if(path.node.property.name.toLowerCase() === 'consumer'){
            // console.group('match found');
            // if DeclarationStore includes left side expession
            if(DeclarationStore.includes(path.node.object.name)){
              contextCount++;
              contextToUse = path.node.object.name;
              // console.log('context is found and contextToUse is', contextToUse);
            }
          }
          // if the contextToUse we pulled out is in DeclarationStore
          // enter into component, in component insertBefore or insertAfter
          // unshift container, push container
        }  
    })
    // console.log('contextCount is', contextCount);
    let i: number = 0;
    path.traverse({
      ClassMethod(path: Path): void {
        // console.log('inside the ClassMethod node')
        // console.log(path.node.type);
        //while loop to break out of when we have inserted the appropriate amount of useContext statements with the imported Contexts that we have
        //so we don't insert a useContext statement after EVERY classmethod.  
        while(i < contextCount/2){
          path.insertBefore(

            t.variableDeclaration("const", 
            [t.variableDeclarator(
              t.identifier('imported'+`${contextToUse}`), 
              t.callExpression(t.identifier("useContext"),
              [t.identifier(`${contextToUse}`)]
              )
              )]
            )
          )  
          i++;
        }
      }
    })          
  }
}


​

const ImpSpecVisitor: {ImportSpecifier: (path: Path) => void} = {
  // method for traversing through all the ImportSpecifiers
  ImportSpecifier(path: Path): void {
    // check to see if the property 'imported' is an identifier with the name 'Component'
    // console.log('inside the import specifier visitor function')
    if (path.get('imported').isIdentifier({name: 'Component'})) {
      // console.log(path.node);
      // replace the current path (importSpecifier) with multiple new importSpcefiers
      path.replaceWithMultiple([
        t.importSpecifier(t.identifier('useState'), t.identifier('useState')),
        t.importSpecifier(t.identifier('useEffect'), t.identifier('useEffect')),
        t.importSpecifier(t.identifier('useContext'), t.identifier('useContext')),
      ]);
    }
    // console.log('path.node is ', path.node);
  }
}

let componentName: string = '';

//function to visit export statement and grab componentName to store in 
const ExportStatementVisitor: {ExportDefaultDeclaration: (path: Path) => void} = {
  ExportDefaultDeclaration(path: Path): void {
    // console.log('inside the Export Declaration');
    // console.log('path.node is', path.node.declaration.name)
    componentName = path.node.declaration.name;
    // console.log('componentName is', componentName);
  }
}


const ClassToFuncVisitor: {ClassDeclaration: (path: Path) => void} = {
  //write the program path method, 
  ClassDeclaration(path: Path): void {
    console.log('inside the Class Declaration Function')
    const hasProps: boolean = false;
    let possibleProps: string = '';
    console.log('-----------------------------------------')
    path.traverse({
      ClassMethod(path: Path): void {
        if(path.get('key').isIdentifier({name: "constructor"})){
          console.log('within the class method traversal and key -> constructor is found')
          possibleProps = path.get('params')[0].node.name;
          //grab the value at params[0].name\
          console.log('possibleProps is', possibleProps)
        }
      }
    })        
    let blockStatement: any = null;
    if(path.get('id').isIdentifier({ name: `${componentName}`})){
      // console.log('we have ourselves a function!!!')
      blockStatement = path.node.body.body;
      // console.log('possible blockStatement is', blockStatement)
      // const blockStatement = path.node.body.body;
      // console.log('blockStatement is ', blockStatement)


      // console.log('blockStatement is', blockStatement)
      // const props: any [] = hasProps ? [t.identifier("props")] : [];
      path.traverse({
        ClassMethod(path: Path): void {
          // path.remove();
        }
      })       

      
      path.replaceWith(
        t.variableDeclaration("const", 
        [t.variableDeclarator(
          t.identifier(`${componentName}`), 
          t.arrowFunctionExpression(possibleProps, t.blockStatement(blockStatement)) 
          )
        ])
      )
    }
  }
}
  




​

// the main method to traverse the ast
parserMethods.traverse(ast, {
  // specify an entry method to traverse downward
  enter(path: any) {
    // traverse through our visitor that we defined above
    // vist the imprt statement, take out component and insert hooks
    path.traverse(ImpSpecVisitor);
    //export statement visitor looks for the component name, in this case "App", and store 
    path.traverse(ExportStatementVisitor);
    //visit the import Declaration and push import components into an array to check during the useContextDeclaration in the next traversal
    path.traverse(ImpDeclVisitor);
    //build the use context statement out of the 
    path.traverse(UseContextDecl);
    // path.traverse(ClassToFuncVisitor);

  }
})
// console.log(parserMethods.generate);

const updatedAST = parserMethods.generate(ast as any);
fs.writeFileSync('ast.jsx', updatedAST.code as string);

// console.log('post ast is ', ast)


export {}




//old func
// const ClassToFuncVisitor: {ClassDeclaration: (path: Path) => void} = {
//   ClassDeclaration(path: Path): void {
//     const hasProps: boolean = false;

//       //traverse to constructor(props) to see if props exist, if so flip the hasProps boolean to true
//     if(path.get('params').isIdentifier({name: "props"})) { !hasProps };
//     console.log('hasProps boolean should be true and right now it is', hasProps);
    
//     if(path.get('id').isIdentifier({ name: "App"})){
//       const blockStatement = path.node.body.body;
//       console.log('blockStatement is', blockStatement);
//       // console.log('blockStatement is', blockStatement)
//       const props: any [] = hasProps ? [t.identifier("props")] : [];
      
//       // path.replaceWith(
//       //   t.variableDeclaration("const", 
//       //   [t.variableDeclarator(
//       //     t.identifier("App"), 
//       //     t.arrowFunctionExpression(props, t.blockStatement(blockStatement) ) 
//       //     )
//       //   ])
//       // )
//     }  
//   }
// }


