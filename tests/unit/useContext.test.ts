import * as visitors from '../../util/constants/visitors';
import { ptg } from '../testHelperFunctions'

describe('Test should be running', () => {
  it('Should test', () => {
    expect(true).toBe(true)
  })
})

describe('Handles cases in which multiple Contexts have been passed in', () => {
  const str :string = ptg('./unit/components/UCmultiple.jsx', [visitors.ImpDeclVisitor, visitors.classDeclarationVisitor]);
  console.log(str);
  //we have to fix the multiple context consumer tags that was broken in the last "fix" we did before deploy
  xit('')
})

describe('Handles cases in which a single context has been passed in statically', () => {
  const ucStatic: string = './unit/components/UCstatic.jsx';
  const str: string = ptg(ucStatic, [visitors.ImpSpecVisitor, visitors.ImpDeclVisitor, visitors.memberExpVisitor, visitors.classDeclarationVisitor]);
  expect(str).toMatch(
  `import { ThemeContext } from '../contexts/ThemeContext';

  const List = () => {
    const {
      isLightTheme,
      light,
      dark            
    } = useContext(ThemeContext);
  };
    export default List;`);
})

describe('Handles Context.Consumer tags', () => {
  const ucFragment: string = './unit/components/UCfragment.jsx';
  it('replaces .Consumer tags with React.Fragment', () => {s
    const str: string = ptg(ucFragment, [visitors.ImpSpecVisitor, visitors.ImpDeclVisitor, visitors.memberExpVisitor, visitors.classDeclarationVisitor]);
    expect(str).toMatch(`import React, { useState, useEffect, useContext } from 'react';
    import UserWrapper from './containers/UserWrapper';
    import NameContext from './context';
    
    const App = props => {
      const importedNameContext = useContext(NameContext);
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [user, setUser] = useState([{
        fname: 'fred',
        lname: 'flintstone'
      }]);
      return <React.Fragment>
            <div>
              {importedNameContext}
            <p>first name: {user[0].fName}</p>
            </div>
          <UserWrapper user={user} isAuthenticated={isAuthenticated}></UserWrapper>
          </React.Fragment>;
    };
    
    export default App;`);
  });
})



