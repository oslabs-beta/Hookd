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
        // Object.values(stateDep[state]).forEach(lcm => {
        //   const setsState: boolean = stateDep[state][lcm].expressionStatement.setsState 
        //   // UNCOMMENT WHEN FUNCTION DECLARATIONS ARE ACCOUNTED FOR
        //   // || stateDep[state][lcm].functionDeclaration.setsState;
        //   const nodesArr: any[] = [stateDep[state][lcm].expressionStatement.node]
        //   // UNCOMMENT WHEN FUNCTION DECLARATIONS ARE ACCOUNTED FOR
        //   // .concat([stateDep[state][lcm].functionDeclaration.node]);
        //   if (checkIfHandler(lcm)) {
        //     // lcm is some method not related to the regular lcms
        //     // push into an array of handlers
        //     // push name and node
        //     handlers.push(stateDep[state][lcm])
        //     // check if handler is referenced within a given lcm
        //     console.log(handlers);
        //   }
        //   switch(lcm) {
        //     case(n.CDM):
        //     // check how OFTEN the state changes 
        //     // (if state changes only once then we should have an empty depArr)
        //       if (!setsState) {
        //         body = body.concat(nodesArr);
        //       }
        //       else {
        //         body = body.concat(nodesArr);
        //       }
        //     case(n.CDU):
        //     // if some state is referenced in CDU then that should be paying attention to changes in that state
        //     // depArr should contain that state
        //       if (setsState) {
        //         depArr.push(state);
        //       }
        //     case(n.CWU):
        //       // if state is referenced in CWU then there is some cleanup involved with it
        //       returnStatement = returnStatement.concat(nodesArr);
        //     default:
        //       // default statement captures all the handlers referencing that state
        //       console.log('default');
        //     }
        // })