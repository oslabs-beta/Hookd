import {t} from './parser';
import {Path, stateDep, handlerDepTree, Node} from './interfaces';
import {createFunctionDefinitions, checkKeyIdentifier, parseStateDep, checkIfHandler, makeUseStateNode, setStateToHooks, stateToHooks, thisRemover, buildStateDepTree, buildHandlerDepTree, strRemover} from '../helperfunctions';
import * as n from './names';

const HooksStatements: string[] = ['useState', 'useEffect', 'useContext'];
const ContextStore: string[] = [];
const DeclarationStore: string[] = [];
let isAComponent: boolean = true;
export const ImpSpecVisitor: {ImportSpecifier: (path: Path)=> void} ={
  // method for traversing through all the ImportSpecifiers
  ImportSpecifier(path: Path): void {
    if(!HooksStatements.includes(path.node.local.name)){
      DeclarationStore.push(path.node.local.name);
    }
    // check to see if the property 'imported' is an identifier with the name 'Component'
    if (path.get('imported').isIdentifier({name: 'Component'})) {
      // replace the current path (importSpecifier) with multiple new importSpcefiers
      path.replaceWithMultiple([
        t.importSpecifier(t.identifier(n.US), t.identifier(n.US)),
        t.importSpecifier(t.identifier(n.UE), t.identifier(n.UE)),
        t.importSpecifier(t.identifier(n.UC), t.identifier(n.UC)),
      ]);
    }
    
  }
}

export const ImpDeclVisitor: {ImportDeclaration: (path: Path) => void} = { 
  ImportDeclaration(path: Path): void {
    if (!isAComponent) return path.stop();
    path.traverse(ImpSpecVisitor)
    path.traverse({
      ImportDefaultSpecifier (path: Path): void {
        if((!HooksStatements.includes(path.node.local.name) && !DeclarationStore.includes(path.node.local.name))){
          DeclarationStore.push(path.node.local.name);
        }
      }
    })
  }
}

// useState:
export const memberExpVisitor: object = {
  MemberExpression(path: Path): void{
    // additional check to determine if the file is a component
    if (!isAComponent) return path.stop();
    // check if node is of type setState
    if(path.node.property.name === 'setState'){
      const arg0: Path = path.parentPath.get('arguments')[0];
      if (t.isFunction(arg0.node) && (arg0.node.params.length)){
        // should be the arrowFunctionExpression
        const setStateParam = arg0.get('params')[0].node
        // find the member expression
        arg0.traverse({
          MemberExpression(path: Path){
            if(t.isIdentifier(path.node.object, {name: setStateParam.name})){
              strRemover(path as Path, setStateParam.name as string)
            }
          }
        })
      }
      setStateToHooks(path.parentPath as Path);
    }
    // check if the node is just a state reference
    else if (path.node.property.name === 'state' && t.isThisExpression(path.node.object)){
      if(path.parentPath) stateToHooks(path.parentPath as Path);
    } else {
      thisRemover(path as Path);
    }
  }
}

export const classDeclarationVisitor: {ClassDeclaration: (path: Path) => void} = {
  ClassDeclaration(path: Path): void {
    isAComponent = path.node.superClass && (path.get('superClass').isIdentifier({name: 'Component'}) || path.get('superClass').get('property').isIdentifier({name: 'Component'}));
    if (!isAComponent) return path.stop();
    // class declaration
    let componentName: string = path.get('id').node.name;
    // useState
    const useStateData: any[] = [];
    let possibleProps: string = '()';
    // useContext
    let contextToUse: string = '';
    let isStatic: boolean = false;
    let isContext: boolean = false;
    let objectPattern: any;
    let storedBlockStatement: any;
    let multipleContexts: boolean = false;
    // useEffect
    const methodPaths: any[] = [];
    // handlers referencing state
    const handlerDepTree: handlerDepTree = {}
    // dependency tree of state
    const stateDependencies: stateDep = {};
    path.traverse({
      ClassProperty(path: Path): void {
        // checking for static context 'static contextType = ThemeContext'
        if(path.node.static) isStatic = true;
        if (!isStatic) path.stop();
        contextToUse = path.node.value.name;
      }
    })
    path.traverse({
      // need to traverse through handlers first before checking them against references in lcms
      ClassMethod(path: Path):void {
        const cdm = checkKeyIdentifier(n.CDM, path),
        cdu = checkKeyIdentifier(n.CDU, path),
        cwu = checkKeyIdentifier(n.CWU, path),
        render = checkKeyIdentifier(n.R, path),
        constructor = checkKeyIdentifier(n.C, path);
        if (!cdm && !cdu && !cwu && !render && !constructor) {
          let handlerNode = path.node;
          let name: string = path.node.key.name ? path.node.key.name : '';
          let paramNames: any[] = path.node.params;
          let body: any[] = path.node.body.body;
          methodPaths.push([createFunctionDefinitions(name, paramNames, body), path]);
          // check if a handler either setsState or references state
          path.traverse({
            ExpressionStatement(path: Path): void {
              path.traverse({
                MemberExpression(path: Path): void {
                  const stateName: string = path.parentPath.node.property ? path.parentPath.node.property.name : null;
                    if ((t.isIdentifier(path.node.property, {name: 'state'}) || t.isIdentifier(path.node.property, {name: 'props'})) && stateName) {
                      buildHandlerDepTree(handlerDepTree, name, stateName, false, handlerNode);
                    }
                    if(t.isIdentifier(path.node.property, {name: 'setState'})) {
                      let stateProperties: any[] = [];
                      if (t.isObjectExpression(path.parentPath.node.arguments[0])) {
                        stateProperties = stateProperties.concat(path.parentPath.node.arguments[0].properties);
                      }
                      else if (t.isArrowFunctionExpression(path.parentPath.node.arguments[0])) {
                        path.parentPath.node.arguments[0].body.body.forEach((bodyEl: Node) => {
                          if (t.isReturnStatement(bodyEl) && bodyEl.argument.properties) stateProperties = bodyEl.argument.properties;
                        })
                      }
                      if (stateProperties.length > 0) {
                        stateProperties.forEach(property => {
                          const setStateName: string = property.key.name;
                          buildHandlerDepTree(handlerDepTree, name, setStateName, true, handlerNode);
                        })                        
                       }    
                }
              }
              });
            }
          });
        }
        // traverse into variable declarator to check for a member expression with the name 'context'
        path.traverse({
          VariableDeclarator(path: Path): void {
            path.traverse({
              MemberExpression(path: Path): void {
                if(path.node.property.name === "context"){
                  // flip this boolean to run other functions dependent on it
                  isContext = true;
                }
              }
            })
            // 
            if(isContext){
              if(path.node.id.type === "ObjectPattern"){
                // check for destructured object
                // should only run if we've found context
                objectPattern = path.node.id;
                path.parentPath.remove();
              }
            }  
          }
        })
      }
    });
    // useContext:
    // if we find a static property, that property is the context we're looking for and it is destructured then create a variable declarator for useContext
    if(isStatic && isContext && objectPattern){
      path.traverse({
        ClassProperty(path: Path): void {
          if(path.node.static) { 
            path.replaceWith(
              t.variableDeclaration("const",
                [t.variableDeclarator(objectPattern,
                  t.callExpression(
                    t.identifier('useContext'),[
                      t.identifier(`${contextToUse}`)
                    ]
                  )
                )]
              )
            )
          }
        }
      })
    }
    path.traverse({
      ClassMethod(path: Path): void {
        let currMethodName = path.node.key.name;
        const cdm = checkKeyIdentifier(n.CDM, path),
        cdu = checkKeyIdentifier(n.CDU, path),
        cwu = checkKeyIdentifier(n.CWU, path),
        render = checkKeyIdentifier(n.R, path),
        constructor = checkKeyIdentifier(n.C, path);
        // traverse through all expression statements and function declarations within a classMethod to create general stateDepTree
        // need to change this logic so that it's encapsulated within the body of each lcm
        // otherwise its not going to find the highest level node for the stateful reference
        // e.g., this.map.on('load', () => { this.setState({mapLoaded: true})})
        // won't be captured, instead only the setState expressionStatement will be kept
        path.traverse({
          ExpressionStatement(path: Path): void {
            let expressionStatement: any = path.node;
            let functionDeclaration: any;
            if (path.parentPath.parentPath.node.type === 'FunctionDeclaration') functionDeclaration = path.parentPath.parentPath.node;
            path.traverse({
              MemberExpression(path: Path): void {
                const stateName: string = path.parentPath.node.property ? path.parentPath.node.property.name : null;
                let isHandler = checkIfHandler(currMethodName);
                if (!isHandler) {
                  // assign expressionstatement node to functiondeclaration node if there is one
                  if (functionDeclaration) expressionStatement = functionDeclaration;
                  // check if the current member expression is a state object
                  if (t.isIdentifier(path.node.property, {name: 'state'}) && stateName) {
                    buildStateDepTree(currMethodName, expressionStatement, stateDependencies, stateName, false);
                  }
                  // check if member expression is a setState object
                  if(t.isIdentifier(path.node.property, {name: 'setState'})) {
                    let stateProperties: any[] | undefined;
                       stateProperties = path.parentPath.node.arguments[0].properties;
                      if (!stateProperties) {
                          path.parentPath.node.arguments[0].body.body.forEach((bodyEl: Node) => {
                            if (t.isReturnStatement(bodyEl)) stateProperties = bodyEl.argument.properties;
                          })
                       }
                    stateProperties.forEach(property => {
                      const setStateName: string = property.key.name;
                      buildStateDepTree(currMethodName, expressionStatement, stateDependencies, setStateName, true);
                    })
                  }
                }
              
              }
            })
          }
        })
         // look specifically for the constructor method, where all the state is held
         let stateArr: any[];
         if(constructor){
          possibleProps = path.get('params').length === 0 ? possibleProps: path.get('params')[0].node.name;
          let assignmentExpressionExists = false;
          path.traverse({
            AssignmentExpression(path: Path): void{
              assignmentExpressionExists = true;
              if (t.isExpression(path.node, {operator: '='})) {
                if(t.isIdentifier(path.get('left').node.property, {name: 'state'})) {
                  // in an Assignment Expression, there will be a left and a right
                  // left will be what is the label/key and right will be the value(s) of what's being assigned
                  // we keep the value(s) in a variable. it will be an array.
                  stateArr = path.get('right').node.properties;
                }
              }
            }
          })
          // in the case that there is no assignment expression for state
          if (!assignmentExpressionExists) path.remove();
          else useStateData.push(path, stateArr);
        } 
        if (cdm || cdu || cwu) {
          //traverse through lcm and check if a handler that uses state is referenced. If it is then build the handlerDepTree using the node that references that handler
          path.traverse({
            ExpressionStatement(path: Path): void {
            // expressionStatement acts as a catch all for node paths. The variable can be reassigned to a node OTHER than an expression statement.
              let expressionStatement: Node = path.node;
              let functionDeclaration: Node;
              if (path.parentPath.parentPath.node.type === 'FunctionDeclaration') functionDeclaration = path.parentPath.parentPath.node;
              path.traverse({
                MemberExpression(path: Path): void {
                  // if the node path is wrapped by a function declaration reassign the expressionStatement to the functionDec
                  if (functionDeclaration) expressionStatement = functionDeclaration;
                  Object.keys(handlerDepTree).forEach(handlerName => {
                    if (handlerName === path.node.property.name) {
                      const stateNames = Object.keys(handlerDepTree[handlerName]);
                      // loop through the stateNames array and build the handler dependency tree for the first pass
                      stateNames.forEach(statename => {
                        const setsState = handlerDepTree[handlerName][statename].setsState;
                        const node = handlerDepTree[handlerName][statename].node;
                        buildHandlerDepTree(handlerDepTree, handlerName, statename, setsState, node, currMethodName, expressionStatement)
                      })
                    }
                  })            
                }
              })
            }
          })
          path.remove();
        }
        if(render) path.replaceWithMultiple(path.node.body.body);
     }
    })
    methodPaths.forEach(arr => {
      arr[1].replaceWith(arr[0])
    })
    // need to change position of useEffect so it's after state declarations
    parseStateDep(stateDependencies, handlerDepTree).forEach(UE => {
      path.get('body').unshiftContainer('body', UE);
    })
    // prepends 'const [state, setState] = useState(initVal)' outside of the constructor function
    // makeUseStateNode(path as any, state as any);
    makeUseStateNode(useStateData[0] as any, useStateData[1] as any).forEach(stateNode => path.get('body').unshiftContainer('body', stateNode))
    path.traverse({
      JSXElement(path: Path): void {
        path.traverse({
          JSXMemberExpression(path: Path): void {
            // useContext:
              //if right side of expression is "consumer", grab the value on the left side of the dot to constuct the useContext statement
            if(path.node.property.name.toLowerCase() === 'consumer' && DeclarationStore.includes(path.node.object.name)){
              // if DeclarationStore includes left side expession
              // contextStore checks import statement context name against what is included as the context wrapper
              if(!ContextStore.includes(path.node.object.name)){
                // if they match, push the name into the ContextStore.
                ContextStore.push(path.node.object.name);
              }
            }
            // check for multiple context consumers
            if(ContextStore.length > 1)multipleContexts = true; 
            else contextToUse = ContextStore[0];
            // if there's a consumer context replace that node with a Fragment
            if(path.node.property.name.toLowerCase() === 'consumer' &&  path.node.object.name === contextToUse){  
                path.replaceWith(
                  t.jSXMemberExpression(t.jSXIdentifier('React'), t.jSXIdentifier('Fragment'))
                )
              } 
          }
        })
        if(!multipleContexts && contextToUse !== ''){
        path.traverse({
          JSXExpressionContainer(path: Path): void {
            let importedContext: string = 'imported' + contextToUse;
            path.traverse({
              ArrowFunctionExpression(path: Path): void{
                path.replaceWith(
                  t.ExpressionStatement(
                    t.identifier(`${importedContext}`)
                  )
                )
              }
            })
          }
        })
       }
       if(multipleContexts){
        ContextStore.forEach((e) => {
          path.traverse({
            JSXExpressionContainer(path: Path): void {
              path.traverse({
                ArrowFunctionExpression(path: Path): void {
                      path.traverse({
                        VariableDeclarator(path: Path): void {
                          if(path.node.init.name !== undefined) {
                            if(path.node.init.name.toUpperCase() === e.toUpperCase()){
                              objectPattern = path.node.id;
                              path.replaceWith(
                                t.variableDeclarator(objectPattern,
                                  t.callExpression(
                                    t.identifier('useContext'),[
                                      t.identifier(`${e}`)
                                    ]
                                  )
                                )
                              )
                              path.stop();
                            }
                          } 
                        } 
                      })
                  //grab block statement to swap with JSX opening element 
                  if(path.node.body.type === "BlockStatement")storedBlockStatement = path.node.body.body;
                }
              })
            }
          })//end of forEach
        })
      }
      }
    })
    path.traverse(memberExpVisitor);
    // if there is no static type context or multiple contexts then we set context name to the one we found in the import statement
    if(!isStatic && !multipleContexts && contextToUse){
      console.log(contextToUse);
      path.get('body').unshiftContainer('body',
        t.variableDeclaration("const", 
        [t.variableDeclarator(
          t.identifier('imported'+`${contextToUse}`), 
          t.callExpression(t.identifier("useContext"),
          [t.identifier(`${contextToUse}`)]
          )
          )]
        )
      )
    }
    // looks for multiple context statements and gets new entire stored body
    storedBlockStatement = path.node.body.body;
    path.replaceWith(
      t.variableDeclaration("const", 
      [t.variableDeclarator(
        t.identifier(`${componentName}`), 
        t.arrowFunctionExpression([t.identifier(possibleProps)], t.blockStatement(storedBlockStatement)) 
        )
      ])
    )
  }
  }