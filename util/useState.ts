
// create functions in here and export in object
import * as parserMethods from './parser';
const { parse, traverse, t, generate } = parserMethods;
import * as path from 'path';
import * as fs from 'fs';
// App is now a string with full definition
const App: string = fs.readFileSync(path.resolve(__dirname as string, '../static/dummyData/app.jsx'), 'utf-8');
// const App: string = require('../static/dummyData/app.jsx').toString();

// // this logs the file's definition
// console.log(App);

// the files gets parsed into an AST (Abstract Syntax Tree)
let ast: any = parse(App as string);

// keeping global state for state to keep track of. can be placed in local scope to not have global var
let state: any;
const constructorVisitor = {
  ClassDeclaration(path: any){
    path.traverse({
      ClassMethod(path: any){
         path.traverse({
          Identifier(path: any){
            if(t.isIdentifier(path.node, {name: 'constructor'})){
              path.parentPath.traverse({
                AssignmentExpression(path: any){
                  console.log('in AssignmentExpression')
                  if (t.isExpression(path.node, {operator: '='})) {
                    if(path.node.left.property.name === 'state') {
                      console.log(path.node)
                      state = path.node.right.properties;
                    }
                  }
                }
              })
              // this method will remove all of consructor() and leave a huge ass empty space
              // find out how to remove all the white space and insert useState
              // path.parentPath.remove()
              makeUseStateNode(path as any, state as any)
            } else {
              // logic to traverse through other class methods go here
            }
          }
        })
      }
    })
  }
}

/**
 * this func will create 'const [state, setState] = useState(initState);' from 'rightObjProps' and insert as sibling from 'path'
 * @param path the path to append siblings to before deletion
 * @param rightExpr the props array from ObjectExpression which contains the state
 */

function makeUseStateNode(path: any, rightObjProps: any){
  // the rightObjProps will be an array
  for (let i = 0; i < rightObjProps.length; i++){
    // declare the node itself to make it easier to work with
    const objExp = rightObjProps[i];
    // an ObjectExpression will contain a key with a Node type 'Identifier'
    const key =  objExp.key;
    // the actual name of the state as a string and not a Node type
    const keyName = key.name;
    // an ObjectExpression will contain a value with a Node type of any Expression (another nested Object or any value)
    const val = objExp.value;
    // declare an array pattern for the '[state, setState]'
    const arrPatt = t.arrayPattern([t.identifier(keyName), t.identifier('set' + upFirstChar(keyName))]);
    // declares 'useState(initVal)'
    const callExp = t.callExpression(t.identifier('useState'), [val])
    // creates '[state, setState] = useState(initVal);'
    const varDecl = t.variableDeclarator(arrPatt, callExp);
    // adds 'const [state, setState] = useState(initState);' as a sibling
    path.parentPath.insertBefore(t.variableDeclaration('const', [varDecl]))
  }
  // path.parentPath.remove();
}

/**
 * this will uppercase the first letter in the string
 * @param string the string to affect
 * @returns a string
 * taken from a website do not steal
 */

const upFirstChar = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);


traverse(ast , {
  enter(path: any) {
    path.traverse(constructorVisitor);
  }
})
const original = generate(ast as any);

fs.writeFileSync('test/ast.jsx', original.code as string);

module.exports = {}