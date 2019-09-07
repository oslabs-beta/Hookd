import { Path, Node } from "../util/constants/interfaces";
import * as fs from 'fs';
import * as path from 'path';
import { parse, traverse, generate, t} from '../util/constants/parser'

/**
 * Will parse, traverse, and generate code (a string of transformed code) depending on the visitors you give it
 * filePath will be relative to this file's directory
 * @param filePath The path of file to parse, traverse and generate code from
 * @param arrVisitors The visitors to use as an array
 */
export function ptg(filePath: string, arrVisitors: object[]): string {
  // parse
  const ast = parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8') as string);
  // traverse
  traverse(ast, {
    enter(path: Path) {
      for (let i = 0; i < arrVisitors.length; i++) path.traverse(arrVisitors[i])
    }
  })
  // generate
  return generate(ast).code;
}