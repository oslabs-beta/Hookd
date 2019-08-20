const parserMethods: any = require('./parser.ts');
const fs: any = require('fs');
const path: any = require('path');

const file: string = fs.readFileSync(path.resolve((__dirname as string), '../../static/dummyData/app.jsx')).toString();
console.log(file);
const ast: object = parserMethods.parse(file); 
console.log(ast);
// create functions in here and export in object
module.exports = {

}