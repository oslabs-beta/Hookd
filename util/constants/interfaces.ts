export interface Node {
  type: string;
  name: string;
  Identifier: any;
  body: {body: any[]};
  params: any[];
  key: {name: string};
  arguments: any[];
  property: {name: string};
  local: {name: string};
  object: {name: string};
  specifiers: {name: string};
  superClass: {name: string};
  operator:{body: any[]}
}
export interface Path {
  node: Node;
  traverse: ({}) => any;
  replaceWithMultiple: ([]:any) => any;
  replaceWith: (newNode: any) => any;
  findParent: (callback: (path: Path) => any) => any;
  isImportSpecifier: () => any;
  getMemberExpressionParent: () => any;
  isMemberExpression: () => any;
  get: (type: string) => any;
  parentPath: any;
  insertBefore: (node: any) => any;
  insertAfter: (node: any) => any;
  remove: () => void;
}
export interface expressionStatement {
  node: Node;
  // check if a function
  setsState?: boolean;
};
export interface functionDeclaration {
  node: Node;
  name: string;
  setsState?: boolean;
}
type stateProps = 
{[lcm: string]: {
  expressionStatement?: expressionStatement;
  functionDeclaration?: functionDeclaration;
}} 
& {expressionStatement?: expressionStatement}
& {functionDeclaration?: functionDeclaration}

export interface stateDep {
      [state: string]: stateProps;
}
