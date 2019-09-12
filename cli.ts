import {parse,traverse,generate} from './util/constants/parser';
import {ImpDeclVisitor, classDeclarationVisitor} from './util/constants/visitors';
import * as fs from 'fs';
import * as path from 'path';

if (process.argv[2]) {
  const file: string = fs.readFileSync(path.resolve((__dirname as string), process.argv[2]), 'utf-8').toString();
  const ast: object = parse(file); 
  traverse(ast, {
    enter(path: any) {
      path.traverse(ImpDeclVisitor);
      path.traverse(classDeclarationVisitor);
    }
  })
  const newCode: string = generate(ast).code;
  if (!fs.existsSync(path.resolve(__dirname, './hookd'))) fs.mkdirSync(path.resolve(__dirname, 'hookd'));
  fs.writeFileSync(path.join(__dirname, `./hookd/${process.argv[2].split(/(\\|\/)/g).pop()}`), newCode as string)
}
else {
  throw Error('A path was not specified');
}