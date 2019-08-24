const parser: any = require('@babel/parser');
const traverse: any = require('@babel/traverse').default;
const t: any = require('@babel/types');
const generate: any = require('@babel/generator').default;

function parse(file: string): any {
  const ast: any = parser.parse(file, {
    sourceType: 'module',
    plugins: ['jsx']
  })
  console.log(ast);
  return ast;
}
export {
  parse,
  traverse,
  t,
  generate
}