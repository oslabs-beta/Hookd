import {t} from './constants/parser';
import {Path, stateDep, handlers, lcms, handlerObj, handlerDepTree, Node} from './constants/interfaces';
import * as n from './constants/names';

function depArr (stateToCheck?: any []): any {
  if (!stateToCheck) return null;
  if (stateToCheck.length === 0) return t.arrayExpression();
  return t.arrayExpression(stateToCheck.map(state => {
    if (Array.isArray(state)) return state.map(innerStateArr => t.Identifier(innerStateArr));
    return t.Identifier(state)
  }));
  }
function createReturnStatement (returnFunction: any): any {
  // define 'return'
  // console.log(returnFunction);
  return [t.returnStatement(
    // define '()=> {}'
    t.arrowFunctionExpression(
      // params- 'none'
      [],
      // blockstatement [t.expressionStatement(t.thisExpression())]
      t.blockStatement(returnFunction)
    )
    )]
}
export function createUseEffect (body: any[], opts?: {lcm?: string, returnFunction?: any[], stateToCheck?: any []} ): string {
  // determine what second argument (if any) should be passed into createSecondArg
  const secondArg: any[] = 
  opts.lcm === 'componentDidMount' 
  // if componentDidMount call createSecondArg without an argument to return an Array Expression without any value
  ? depArr()
  // if componenDidUpdate call createSecondArg with the stateToCheck 
  : depArr(opts.stateToCheck)
  // returnStatement is of type returnStatement
  const returnStatement: any[] = opts.returnFunction.length > 0 ? createReturnStatement(opts.returnFunction) : [];
  // create the expressionstatement
  // console.log(body.concat(returnStatement));
  if (!secondArg) return t.ExpressionStatement(
    //  use the identifier useEffect
      t.callExpression(t.identifier('useEffect'),
      //arrow function argument
      [t.arrowFunctionExpression([], t.blockStatement(body.concat(returnStatement)))]
      )
    );
 return t.ExpressionStatement(
  //  use the identifier useEffect
    t.callExpression(t.identifier('useEffect'),
    //arrow function argument
    [t.arrowFunctionExpression([], t.blockStatement(body.concat(returnStatement))),
    secondArg //put optional argument for empty array
    ])
  );
}

export function createFunctionDefinitions(name: string, paramNames: any[], body: any[]) {
  // const params: any[] = paramNames.map(param => t.identifier(param));
  return t.functionDeclaration(t.identifier(name), 
    paramNames, 
    t.blockStatement(body)
  )
}
// checks for key identifiers for method names
export function checkKeyIdentifier(name: string, path: Path): any {
  return path.get('key').isIdentifier({name})
}
// checks if the current method is a non-lcm handler
export function checkIfHandler(methodName: string) {
  if (methodName !== n.CDM && methodName !== n.CDU && methodName !== n.CWU && methodName !== n.C && methodName !== n.R) return true;
  return false;
}
/** 
 * @param stateDep is the stateDepTree of all state references within lcms. See interfaces.ts, stateDep
 * @param handlerDepTree is the handlerDepTree that refences all non-lcm methods that are referenced within lcm methods.  See interfaces.ts, handlerDepTree
 * Does the major work to parse through the created stateDepTree/handlerDepTree to format the depTree into their corresponding UE hooks.
 * This is based on several things but boils down to the type of lcm the expressionstatement was called in and whether it setsState.
 * 
*/
export function parseStateDep(stateDep: stateDep, handlerDepTree? : handlerDepTree) {
  // array of useEffect hooks
  let useEffectArr: any[] = [];
  // need to account for two cases for handlerDepTree
  // case 1: stateful references are more than 1
  // loop through the lcms array and build the UE opts from lcm expressionstatement, setsState property, and lcm name
  // (all state properties should have the same reference to the expression statements)
  // this will be its own UE hook 
  // case 2: stateful references === 1
  // handler should be grouped with the rest of the stateArr
  if (handlerDepTree) {
    // check data and reformat it to use in rest of code
    const handlerUseEffect = Object.entries(handlerDepTree);
      handlerUseEffect.forEach(handlerArr => {
        const handlerName: string = handlerArr[0];
        const stateArr = Object.entries(handlerArr[1]);
        // if the handler doesn't have any lcm references there's no need to put it in UE
        console.log('!!!!!!!!!!!!!!!!!!!!')
        console.log('stateArr: ', stateArr)
        if (stateArr[0][1].lcms.length === 0) delete handlerDepTree[handlerName];
        else {
          let mappedLcmsObj: any;
          // set key name for stateDepTree
          let stateDepTreeKey: string;
          // if there is more than one stateful reference within a handler, logic pertaining to that handler needs to be grouped together
          stateArr.forEach(statePair => {
            const lcmsObj = statePair[1];
            mappedLcmsObj = lcmsObj.lcms.map(lcm => {
              return {expressionStatement: {node: lcm.expressionStatement, setsState: lcmsObj.setsState}, name: lcm.name};
            });
          });
          if (stateArr.length > 1) {
            // key becomes the entire array of state that is being tracked through the handler
            const stateNameKeys: string[] = Object.keys(handlerArr[1]);
            stateDepTreeKey = JSON.stringify(stateNameKeys);
            stateDep[stateDepTreeKey] = {lcms: mappedLcmsObj};
           }
          else {
            stateDepTreeKey = stateArr[0][0];
            console.log('stateDepTreeKey: ', stateDepTreeKey);
            console.log('mappedLcmsObj for length of 1: ', mappedLcmsObj);
            stateDep[stateDepTreeKey].lcms = stateDep[stateDepTreeKey].lcms.concat(mappedLcmsObj);
          }
        }
      })
  }
  const stateArr = Object.keys(stateDep);
  // for each state that is being tracked through the lcms we must check all lcm properties
  stateArr.forEach(state => {
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // console.log('state: ', state);
    // console.log('stateDep[state]', stateDep[state]);
    // body to pass into useEffect
    let body: any[] = [];
    let opts: {lcm?: string, returnFunction?: any[], stateToCheck?: any[]} = {
      lcm: '',
      returnFunction: [],
      stateToCheck: []
    };
    // catches duplicates within nodes
    const nodeCache: any = {};
    if(stateDep[state].lcms) {
      stateDep[state].lcms.forEach(lcm => {
        const setsState: boolean = lcm.expressionStatement.setsState 
        const node: Node = lcm.expressionStatement.node;
        const nodeKey = JSON.stringify(node);
        const CDU: boolean = lcm.name === n.CDU;
        const CWU: boolean = lcm.name === n.CWU;
        // console.log({setsState, CDU})
        if (!nodeCache[nodeKey]){
          if (!CDU && !setsState && !CWU) {
            opts.stateToCheck = null;
            body.push(node);
          }
          if (!CDU && setsState && !CWU) {
            console.log(node);
            opts.stateToCheck = [];
            body.push(node);
          }
          if (CDU && setsState && !CWU) {
            if(!opts.stateToCheck) opts.stateToCheck = [];
            // parse the state in the case where we pass in a stringified array for handlers
            const newState = state.charAt(0) === '[' ? JSON.parse(state) : state;
            opts.stateToCheck.push(newState);
            body.push(node);
          }
          if (CWU) {
            console.log(node);
            opts.returnFunction.push(node);
          }
          nodeCache[nodeKey] = true;
        }
      })
      useEffectArr.push(createUseEffect(body, opts));
    }
  })
  return useEffectArr;
}
/**
 * this will uppercase the first letter in the string
 * @param string the string to affect
 * @returns a string
 * taken from a website do not steal
 */
const upFirstChar = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
/**
 * this func will create 'const [state, setState] = useState(initState);' from 'rightObjProps' and insert from 'path'
 * @param path the path to append siblings to before deletion
 * @param rightExpr the props array from ObjectExpression which contains the state
 */
export function makeUseStateNode(path: Path, rightObjProps: any[]): Node[] {
  if (rightObjProps === undefined) return [];
  const states = [];
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
    const callExp = t.callExpression(t.identifier('useState'), [val]);
    // creates '[state, setState] = useState(initVal);'
    const varDecl = t.variableDeclarator(arrPatt, callExp);
    // adds 'const [state, setState] = useState(initState);' as a sibling
    states.push(t.variableDeclaration('const', [varDecl]));
    // path.insertBefore(t.variableDeclaration('const', [varDecl]))
  }
  // console.log(states);
  path.remove();
  return states;
}

/**
 * replaces this.setState({ state: newState }) with setState(newState)
 * ALERT -- place function within member expression visitor
 * @param parentPath exactly what it says
 */
export function setStateToHooks(parentPath: any): void {
  // this will be an array of arguments to make setState Call Arguments with
  const args = parentPath.node.arguments[0].properties
  const states = [];
  for (let i = 0; i < args.length; i++){
    const keyName = args[i].key.name;
    const call = t.identifier('set' + upFirstChar(keyName))
    const arg = args[i].value;
    const callStatement = t.callExpression(call, [arg])
    const expStatement = t.expressionStatement(callStatement)
    states.push(expStatement)
  }
  parentPath.replaceWithMultiple(states)
}

/**
 * turns 'this.state.example' expressions to 'example'
 * @param parentPath path.parentPath. this. what it says.
 */
  export function stateToHooks (parentPath: any): void {
    if (t.isMemberExpression(parentPath.parentPath.node)) parentPath.parentPath.node.object = parentPath.node.property;
	  else parentPath.replaceWith(parentPath.node.property);
  }

  /**
   * will DECIMATE all other this statements no matter what. Used within MemberExpression Visitor
   * WARNING: will literally destroy any and all 'this' statements
   * @param path pass in the path of MemberExpression where it will look for anything that has to do with 'this'
   */
  export function thisRemover(path: any): void {
    if (t.isThisExpression(path.node.object)){
      if (t.isMemberExpression(path.node)) path.node.object = path.node.property;
      if (t.isCallExpression(path.node)) path.node.callee = path.node.property;
      else path.replaceWith(path.node.property);
    }
  }

  export function buildStateDepTree(currMethodName: string, expressionStatement: any, stateDependencies: stateDep, stateName: string, setsState: boolean) {
    const lcmsObj: lcms = {
      name: currMethodName, 
      expressionStatement: {
        node: expressionStatement, 
        setsState
      }
    };
    if(stateDependencies.hasOwnProperty(stateName)) {
      stateDependencies[stateName].lcms.push(lcmsObj)
    }
    // if the state property is not defined yet, we need to initialize it
    else {
      stateDependencies[stateName] = {lcms: [lcmsObj]};
    }
  }

  export function buildHandlerDepTree(handlerDepTree: handlerDepTree, handlerName: string,stateName: string, setsState: boolean, node: Node, currMethodName?: string,  expressionStatement?: Node ) {
    // requires two passes, one to set the handlerObj for the initial pass when we discover a handler function
    // the other to add the lcmsObj when we find this handler referenced in a lcm
    const handlerObj: handlerObj = {
      [stateName]: {
        lcms: [],
        node,
        setsState
      }
    };
    
    // check if this is the second pass to add the lcmsObj
    // console.log('inside buildHandlerDepTree', currMethodName, expressionStatement)
    if (currMethodName && expressionStatement) {
      // console.log('lcmsObj traversal was hit')
      const lcmsObj = {
          expressionStatement,
          name: currMethodName
        }
      if(handlerDepTree.hasOwnProperty(handlerName)) {
          handlerDepTree[handlerName][stateName].lcms.push(lcmsObj);
        }
      else {
        handlerDepTree[handlerName] = handlerObj;
      }
    }
    // if we're on our first pass we need to add our handlerObj
    else {
      // if we haven't seen this handler before then add the entire handlerObj;
      if (!handlerDepTree.hasOwnProperty(handlerName)) {
        handlerDepTree[handlerName] = handlerObj;
      }
      else {
        // if our handlerDepTree already has seen a state only update the setsState property with a truthy value
        if (handlerDepTree[handlerName].hasOwnProperty(stateName) && setsState) {
          handlerDepTree[handlerName][stateName].setsState = setsState;
        }
        // if it's a new state ref then add a new object to the handlerName
        else {
          handlerDepTree[handlerName][stateName] = {
            lcms: [],
            node,
            setsState
          };
        }
      }
    }
  }
  