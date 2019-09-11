
export interface Node {
  type: string;
  name: string;
  Identifier: any;
  body: {body: any[], type: string, properties: Node[]};
  params: any[];
  key: {name: string};
  arguments: any[];
  property: {name: string};
  local: {name: string};
  object: {name: string};
  specifiers: {name: string};
  superClass: {name: string};
  operator:{body: any[]}
  program: {program: any};
  declaration: any;
  static: boolean;
  id: any;
  properties: any[];
  value: {name: string};
  init: {name: string};
  callee: any;
  argument: Node;
}
export interface Path {
  node: Node;
  traverse: ({}) => any;
  stop: () => void;
  skip: () => void;
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
  unshiftContainer: (newNode: Node) => void;
  isIdentifier:(type: boolean) => false;

}
export interface stateDep {
  [state: string]: stateProps;
}
type stateProps = {
  lcms?: lcms[],
  handlers?: handlers[]
}
export interface lcms {
  name: string;
  expressionStatement?: expressionStatement;
  // functionDeclaration?: functionDeclaration;
}
export interface expressionStatement {
node: Node;
// check if a function
setsState?: boolean;
};
// export interface functionDeclaration {
//   node: Node;
//   setsState?: boolean;
// }
export interface handlers {
  name?: string;
  node?: any;
  stateName?: string; 
  setsState?: boolean; 
}
export interface handlerDepTree {
  [name: string] : handlerObj  
}
export interface handlerObj {
  [state: string]: {
  //  array of lcms
  lcms: {
    // node that references the handler
    expressionStatement: Node, 
    // name of the lcm
    name: string
  }[],
  // saves entire node of handler
  node: Node;
  // does the handler setState with this piece of state in particular
  setsState: boolean;
}
}