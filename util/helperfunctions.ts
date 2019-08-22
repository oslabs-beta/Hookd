import * as parserMethods from './parser';
const {parse,traverse,t,generate} = parserMethods;
function createSecondArg (stateToCheck?: any []): any {
  if (!stateToCheck) return null;
  if (stateToCheck.length === 0) return t.arrayExpression();
  return t.arrayExpression(stateToCheck);
  }
function createReturnStatement (returnFunction: any): any {
  // define 'return'
  return t.returnStatement(
    // define '()=> {}'
    t.arrowFunctionExpression(
      // params- 'none'
      [],
      // blockstatement
      returnFunction
    )
    )
}
function createUseEffect (body: any[], opts?: {lcm?: string, returnFunction?: any, stateToCheck: any []} ): string {
  // determine what second argument (if any) should be passed into createSecondArg
  const secondArg: any[] = 
  opts.lcm === 'componentDidMount' 
  // if componentDidMount call createSecondArg without an argument to return an Array Expression without any value
  ? createSecondArg()
  // if componenDidUpdate call createSecondArg with the stateToCheck 
  : createSecondArg(opts.stateToCheck)
  // returnStatement is of type returnStatement
  const returnStatement: any = opts.returnFunction ? createReturnStatement(opts.returnFunction) : [];
  // create the expressionstatement
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

export {
  createUseEffect
}