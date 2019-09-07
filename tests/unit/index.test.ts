import { Path, Node } from "../../util/constants/interfaces";
import * as visitors from '../../util/constants/visitors';
import * as fs from 'fs';
import * as path from 'path';
import { parse, traverse, generate, t} from '../../util/constants/parser'


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
 * Will parse, traverse, and generate code depending on the visitors you give it
 * @param filePath The path of file to parse, traverse and generate code from
 * @param arrVisitors The visitors to use as an array
 */
function ptg(filePath: string, arrVisitors: object[]): string {
  // parse
  const ast = parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8') as string);
  // traverse
  traverse(ast, {
    enter(path:Path) {
      for (let i = 0; i < arrVisitors.length; i++) path.traverse(arrVisitors[i])
    }
  })
  // generate
  return generate(ast).code;
}

describe('turns class components to functional components', () => {
  const ast: object = parse(fs.readFileSync(path.resolve(__dirname, './ClassToFunction.jsx'), 'utf-8') as string);
  traverse(ast as object, visitors.classDeclarationVisitor as object);
  const str: string = generate(ast).code as string;
  expect(str).toMatch(/const Test1 \= props \=\>/);
  expect(str).toMatch('const Test2 = () =>')
});

describe('turns state in a class method to useState equivalents',  () => {
  /* 
  const ast = parse(fs.readFileSync(path.resolve(__dirname, './ConstructorToHooks.jsx'), 'utf-8') as string);
  traverse(ast as object, {
    enter(path: Path) {
      path.traverse(visitors.ImpDeclVisitor);
      path.traverse(visitors.classDeclarationVisitor);
    }
  });
  */
  // above is equivalent to below 'ptg'
  const str = ptg('./ConstructorToHooks.jsx', [visitors.ImpDeclVisitor, visitors.classDeclarationVisitor]);
  xit(`doesn't define any state for pure components`, ()=>{
    // find a way to check a node for no state declaration
  })
  it('converts state into useState equivalents', () => {
    expect(str).toMatch(`const [prop, setProp] = useState('properties')`);
    expect(str).toMatch(`const [obj, setObj]`);
  })
  xit('converts class properties state to useState', () => {
    // find a way to convert class property state to hooks and ignore constructor
    expect(str).toMatch('const [short, setShort] = ');
  })
})

// describe('')