// create functions here and export it in object
var parserMethods = require('./parser.ts');
var fs = require('fs');
var path = require('path');
var file = fs.readFileSync(path.resolve(__dirname, '../../static/dummyData/app.jsx')).toString();
console.log(file);
var ast = parserMethods.parse(file);
console.log(ast);
module.exports = {};
