import * as parserMethods from './parser';
const {t} = parserMethods;
import {Path} from './constants/interfaces';

function createSecondArg (stateToCheck?: any []): any {
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
  ? createSecondArg()
  // if componenDidUpdate call createSecondArg with the stateToCheck 
  : createSecondArg(opts.stateToCheck)
  // returnStatement is of type returnStatement
  const returnStatement: any[] = opts.returnFunction ? createReturnStatement(opts.returnFunction) : [];
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
