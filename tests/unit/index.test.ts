import { Path, Node } from "../../util/constants/interfaces";
import * as visitors from '../../util/constants/visitors';
import * as fs from 'fs';
import * as path from 'path';
import { parse, traverse, generate, t} from '../../util/constants/parser'
import { ptg } from '../testHelperFunctions'

/**
 * Commented out are initial tests using shell.js to asynchronously
 * manually run 'hookd' with a file and check the syntax of newly created file
 * 
 * May use for end-to-end testing
 */
// const sh = require('shelljs');
// const cli = require('../index.ts');
// initial tree parsing
// (async ()=>{
//   await sh.cd(path.resolve(__dirname))
//   if (!fs.existsSync('index.js')) await sh.exec('npm run build')
//   // await sh.exec('npm link')
//   await sh.exec('hookd ./ClassToFunction.jsx')
//   // checks for the changing of class to functional component
// })()

/**
 * - Jest is a small doozy to wrap your head around for a day or two learning curve -
 * describe will synchronously deploy, so describe (EYY) what you want to do within them
 * 'it' === 'test'. different syntax, same functionality
 * 'ptg' rocks. self-made function.
 * use shelljs later on to actually test the 'hookd' cli
 */

describe('turns class components to functional components', () => {
  /*
  const ast: object = parse(fs.readFileSync(path.resolve(__dirname, './ClassToFunction.jsx'), 'utf-8') as string);
  traverse(ast as object, visitors.classDeclarationVisitor as object);
  const str: string = generate(ast).code as string;
  */
  // above it similar to the 'ptg' one-liner below
  const str = ptg('./unit/components/ClassToFunction.jsx', [visitors.classDeclarationVisitor]);
  it('Should turn class components to arrow functions', () => {
  expect(str).toMatch(/const Test1 \= props \=\>/);
  expect(str).toMatch('const Test2 = () =>')
  })
  xit('Should ignore classes that are not components', () => {
    // should there be a reason there would be a class declaration inside a jsx file?
    // find out next time in 'Testing 123s'
    expect(str).toBeDefined();
  });
});
