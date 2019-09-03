import {t} from './parser';
import {Path, stateDep} from './constants/interfaces';
import * as n from './constants/names';

function depArr (stateToCheck?: any []): any {
  if (!stateToCheck) return null;
  if (stateToCheck.length === 0) return t.arrayExpression();
  return t.arrayExpression(stateToCheck);
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
 return t.ExpressionStatement(
  //  use the identifier useEffect
    t.callExpression(t.identifier('useEffect'),
    //arrow function argument
    [t.arrowFunctionExpression([], t.blockStatement(body.concat(returnStatement))),
      //put optional argument for empty array
    ],
    )
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
export function checkIfHandler(methodName: string) {
  if (methodName !== n.CDM && methodName !== n.CDU && methodName !== n.CWU && methodName !== n.C && methodName !== n.R) return true;
  return false;
}
// check each lcm in dependency array
export function parseStateDep(stateDep: stateDep) {
  let handlers: any[] = [];
  // options to pass into useEffect contructor function
  
  let useEffectArr: any[] = [];
  const stateArr = Object.keys(stateDep);
  // for each state that is being tracked through the clms we must check all handlers and lcm properties
  stateArr.forEach(state => {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('state: ', state);
      // body to pass into useEffect
    let body: any[] = [];
    // handlers to check against in lcms
    let opts: {lcm?: string, returnFunction?: any[], stateToCheck?: any[]} = {
      lcm: '',
      returnFunction: [],
      stateToCheck: []
    };
    // need to loop through handlers and check if lcms contain the same handler
    // we already know that handlers work with a piece of state
    if(stateDep[state].handlers) {
      stateDep[state].handlers.forEach(handler => {
        handlers.push(handler)
        // console.log(handler);
      })
    }
    if(stateDep[state].lcms) {
      stateDep[state].lcms.forEach(lcm => {
        // console.log(lcm);
        const setsState: boolean = lcm.expressionStatement.setsState 
        const CDU: boolean = lcm.name === n.CDU;
        const CWU: boolean = lcm.name === n.CWU;
        console.log({setsState, CDU})
        if (!CDU && !setsState && !CWU) {
          opts.stateToCheck = null;
          body.push(lcm.expressionStatement.node);
        }
        if (!CDU && setsState && !CWU) {
          opts.stateToCheck = [];
          body.push(lcm.expressionStatement.node);
        }
        if (CDU && setsState && !CWU) {
          opts.stateToCheck.push(state);
          body.push(lcm.expressionStatement.node);
        }
        if (CWU) {
          opts.returnFunction.push(lcm.expressionStatement.node);
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
  console.log(states);
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
