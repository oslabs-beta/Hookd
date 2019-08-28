
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
  setsState?: boolean;
}
export interface handlers {
  name?: string;
  node?: any; 
  setsState?: boolean; 
}
export interface lcms {
  name: string;
  expressionStatement?: expressionStatement;
  functionDeclaration?: functionDeclaration;
}
type stateProps = {lcms?: lcms[], handlers?: handlers[]}
export interface stateDep {
      [state: string]: stateProps;
}
