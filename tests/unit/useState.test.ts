import { Path, Node } from "../../util/constants/interfaces";
import * as visitors from '../../util/constants/visitors';
import * as fs from 'fs';
import * as path from 'path';
import { parse, traverse, generate, t} from '../../util/constants/parser'

describe('should be passing', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})