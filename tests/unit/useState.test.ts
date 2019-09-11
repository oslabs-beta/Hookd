import { Path, Node } from "../../util/constants/interfaces";
import * as visitors from '../../util/constants/visitors';
import * as fs from 'fs';
import * as path from 'path';
import { parse, traverse, generate, t} from '../../util/constants/parser'
import { ptg } from '../testHelperFunctions'

describe('Should be passing', () => {
  it('Should pass', () => {
    expect(true).toBe(true)
  })
})

describe('Turns state in a class method to useState equivalents',  () => {
  /* 
  const ast = parse(fs.readFileSync(path.resolve(__dirname, './ConstructorToHooks.jsx'), 'utf-8') as string);
  traverse(ast as object, {
    enter(path: Path) {
      path.traverse(visitors.ImpDeclVisitor);
      path.traverse(visitors.classDeclarationVisitor);
    }
  });
  */
  // above is equivalent to below 'ptg' function
  const str = ptg('./unit/components/ConstructorToHooks.jsx', [visitors.ImpDeclVisitor, visitors.classDeclarationVisitor]);

  it('Converts state into useState equivalents', () => {
    expect(str).toMatch(`const [prop, setProp] = useState('properties')`);
    expect(str).toMatch(`const [obj, setObj]`);
  })
  xit(`Doesn't define any state for pure components`, ()=>{
    // find a way to check a node for no state declaration
    // also fine not to check as well
  })
  xit(`Converts class properties 'state' to 'useState'`, () => {
    // find a way to convert class property state to hooks
    expect(str).toMatch(`const [short, setShort] = useState('syntax for constructor')`)
  })
  xit(`Catches initialization of state within mounting or handlers`, () => {
    // jesus christ is this necessary
  })
})

describe(`Should convert 'this.(set)State' expressions`, () => {
  const str = ptg('./unit/components/StateToHooks.jsx', [visitors.ImpDeclVisitor, visitors.classDeclarationVisitor]);
  it(`Should change 'this.state.prop' to 'prop'`, () => {
    expect(str).toMatch('{prop}');
  });
  it(`Should change 'this.handler' to 'handler'`, () => {
    expect(str).toMatch('onClick={handler}')
  });
  it(`Should change this.setState({ prop: 'a string'}) to 'setProp('a string')'`, () => {
    expect(str).toMatch(`setProp('this is another idea')`);
  })
  it(`Should account for 'this.setState(() => {... return  {}})'`, () => {
    // accounting without arg in anon func
    expect(str).toMatch(`const str = 'because this is another edge case out of many';`)
    expect(str).toMatch(`setOhno(str)`)
  })
  it(`Should account for 'this.setState((prevProps) => {... return {}})`, () => {
    // accounting for arg in anon func
    expect(str).toMatch(`const str1 = holy + ' because this is another edge case out of many';\n    setOhno(str1);`)
  })
  it(`Accounts for this.setState((state) => ({ state }))`, () => {
    expect(str).toMatch(`setNice(nice + 's')`)
  })
  xit('Should account for this.setState(callback)', () => {
    // how to account for, find and change locally defined functions locally and appropriately
  })
})