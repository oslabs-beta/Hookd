import { ThemeContext } from '../contexts/ThemeContext';

class List extends Component {
  static contextType = ThemeContext;
  render() { 
    const { isLightTheme, light, dark } = this.context;
  }
}
 
export default List;  