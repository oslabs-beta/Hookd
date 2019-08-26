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
  local: {name: string};
  object: {name: string};
  specifiers: {name: string};
  property: {name: string};
  superClass: {name: string};
  operator:{body: any[]}
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
  insertBefore: (newNode: any) => any
}


const DeclarationStore: string[] = [];

//creat function to go through import statements and store in array, checking the Method Defenition 
const ImpDeclVisitor: {ImportDeclaration: (path: Path) => void} = { 
  ImportDeclaration(path: Path): void {
    // console.log('ImportDeclaration path is', path.node)
    // console.log('Pre-traversal, DeclarationStore is' , DeclarationStore);

    //go through import statements storing in DeclStore each identifier name['React','Component, UserWrapper, NameContext]

    // console.log('path.node is ', path.node);
    path.traverse({
      ImportDefaultSpecifier (path: Path): void {
        // console.log('inside path traversal of importDefaultSpecifier')
        // console.log('ImportDefaultSpecifier path is:', path.node)
        // let array = path.node.local;
        // let value = path.node.local.name;
        DeclarationStore.push(path.node.local.name);
        // console.log('is path.node.local an array?:', Array.isArray(path.node.local));
        // console.log('path.node.local looks like this:', path.node.local);
        // console.log('array looks like this', array);
        // console.log('value pulled from path.node.local is', value);
      }
    })
  }
}
   

let contextToUse: any = null;
//contextCount is something we need during the process to build the const...useContext(context) statement.  
let contextCount: number = 0;
//ClassBody -> ClassMethod
const UseContextDecl: {ClassDeclaration: (path: Path) => void} = {
    //if DeclareStore includes path.get...path.get('JSXIdentifier').t.identifier({name})  //do the conversion
  ClassDeclaration(path: Path): void {

    //traverse...
    path.traverse({
      JSXMemberExpression(path: Path): void {
        console.log('inside the classMethod traversal stage of this whole fuckin process')
        
        //this is the direct route to the left and right side of the JSX expression
        //grab value at path.node.property.name
        console.log('path.node.property.name is ---->', path.node.property.name);
        console.log('path.node.object.name is ---->', path.node.object.name);
        //might not be necessary to check the right side could juest check the left, it's just one more level of nesting
        //if right side of expression is "consumer"{
          if(path.node.property.name.toLowerCase() === 'consumer'){
            console.group('match found');
            // if DeclarationStore includes left side expession
            if(DeclarationStore.includes(path.node.object.name)){
              contextCount++;
              contextToUse = path.node.object.name;
              console.log('context is found and contextToUse is', contextToUse);
            }
          }
          // if the contextToUse we pulled out is in DeclarationStore
          // enter into component, in component insertBefore or insertAfter
          // unshift container, push container
        }  
    })
    console.log('contextCount is', contextCount);
    let i: number = 0;
    path.traverse({
      
      ClassMethod(path: Path): void {
        console.log('inside the ClassMethod node')
        console.log(path.node.type);
        //while loop to break out of when we have inserted the appropriate amount of useContext statements with the imported Contexts that we have
        //so we don't insert a useContext statement after EVERY classmethod.  
        while(i < contextCount/2){
          path.insertBefore(
            // t.expressionStatement(
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

const ImpSpecVisitor: {ImportSpecifier: (path: Path) => void} ={
  // method for traversing through all the ImportSpecifiers
  ImportSpecifier(path: Path): void {
    // check to see if the property 'imported' is an identifier with the name 'Component'
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



const ClassDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
  ClassDeclaration(path: Path): void {
    const hasProps: boolean = false;

      //traverse to constructor(props) to see if props exist, if so flip the hasProps boolean to true
    if(path.get('params').isIdentifier({name: "props"})) { !hasProps };
    
    if(path.get('id').isIdentifier({ name: "App"})){
      const blockStatement = path.node.body.body;
      // console.log('blockStatement is', blockStatement)
      const props: any [] = hasProps ? [t.identifier("props")] : [];
      
      path.replaceWith(
        t.variableDeclaration("const", 
        [t.variableDeclarator(
          t.identifier("App"), 
          t.arrowFunctionExpression(props, t.blockStatement(blockStatement) ) 
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
    // path.traverse(ImpSpecVisitor);
    // path.traverse(ClassDeclarationVisitor);
    path.traverse(ImpDeclVisitor);
    path.traverse(UseContextDecl);

  }
})
// console.log(parserMethods.generate);

const updatedAST = parserMethods.generate(ast as any);
fs.writeFileSync('ast.jsx', updatedAST.code as string);

// console.log('post ast is ', ast)


export {}






