import * as visitors from '../../util/constants/visitors';
import {ptg} from '../testHelperFunctions';

describe('The first useEffect case should combine logic from componentDidMount into a useEffect hook without a dependency array or return statement', () => {
  const pathCDM: string = './unit/components/UEwCDM.jsx';
  const cdmStr: string = ptg(pathCDM, [visitors.classDeclarationVisitor]);
  it('Only creates a useEffect hook if we do not setState', () => {
    expect(cdmStr).toMatch(`
    useEffect(() => {
      document.title = bookName;
    });`)
  });
  it('Has no dependency array when there is no componentDidUpdate', () => {
    expect(cdmStr).not.toMatch(`
    useEffect(() => {
      document.title = bookName;
    }, []);`);
  });
  const pathCDU: string = './unit/components/UEwCDU.jsx';
  const cduStr: string = ptg(pathCDU, [visitors.classDeclarationVisitor]);
  it('Has no dependency array when there is not stateful reference within componentDidUpdate', () => {
    expect(cduStr).toMatch(`useEffect(() => {
      document.title = bookName;
    })`);
    expect(cduStr).not.toMatch(
    `useEffect(() => {
      document.title = bookName;
      }, [isAuthenticated])`);
  });
  const pathCWU: string = './unit/components/UEwCWU.jsx';
  const cwuStr: string = ptg(pathCWU, [visitors.classDeclarationVisitor]);
  it('Has no return statement when there is no stateful reference within componentWillUnmount', () => {
    expect(cwuStr).not.toMatch(`useEffect(() => {
      document.title = bookName;
      return () => {
        clearInterval(interval);
      }
    })`)
  });
  it('Makes multiple useEffect hooks for each stateful reference', () => {
    expect(cdmStr).toMatch(
    `useEffect(() => {
      console.log(test2);
     });`);
     
    expect(cdmStr).toMatch(
    `useEffect(() => {
      console.log(test3);
     });`)
  });
})