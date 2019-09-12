import { parse, traverse, generate } from './util/constants/parser';
// if we can modularize visitors more, that'd be swell
import { ImpDeclVisitor, classDeclarationVisitor } from './util/constants/visitors';

// the main method to traverse the ast
function hookd(str: string): string {
  const ast = parse(str);
  traverse(ast, {
    enter(path: any) {
      path.traverse(ImpDeclVisitor);
      path.traverse(classDeclarationVisitor);
    }
  });
  return generate(ast).code;
}

module.exports = hookd;