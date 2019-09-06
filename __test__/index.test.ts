import { Path, Node } from "../util/constants/interfaces";
const fs = require('fs');
const path = require('path');
const { parse, traverse, generate, t} = require('../util/constants/parser.ts');
const sh = require('shelljs');
// const cli = require('../index.ts');
// initial tree parsing
let postAst: object;
(async ()=>{
  await sh.cd(path.resolve(__dirname))
  if (!fs.existsSync('index.js')) await sh.exec('npm run build')
  // await sh.exec('npm link')
  await sh.exec('hookd ./ClassToFunction.jsx')
  postAst = parse(fs.readFileSync(path.resolve(__dirname, './test/newFile.jsx'), 'utf-8') as string)
  // checks for the changing of class to functional component
})()
it('class to function', () => {
  const testNode: Node[] = [];
  traverse(postAst, {
    enter(path: Path) {
      path.traverse({
        VariableDeclarator(path: Path){
          testNode.push(path.node);
        }
      })
    }
  })
  expect(testNode).toHaveLength(2);
  expect(testNode[0].name).toBe('Test1');
});