const parser: any = require('@babel/parser');
const traverse: any = require('@babel/traverse');
const t: any = require('@babel/types');

function parse(file: string): any {
  const ast: any = parser.parse(file, {
    sourceType: 'module',
    plugins: ['jsx']
  })
  console.log(ast);
  return ast;
}
module.exports = {
  parse,
  traverse,
  t
}