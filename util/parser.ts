 const parser: any = require('@babel/parser');
export const traverse: any = require('@babel/traverse').default;
export const t: any = require('@babel/types');
export const generate: any = require('@babel/generator').default;

export function parse(file: string): any {
  const ast: any = parser.parse(file, {
    sourceType: 'module',
    plugins: ['jsx']
  })
  return ast;
}
