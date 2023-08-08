/* Copyright (c) 2023, Artcompiler Inc */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

export class Checker extends BasisChecker {
}

export class Transformer extends BasisTransformer {
  PROG(node, options, resume) {
    if (!options) {
      options = {};
    }
    this.visit(node.elts[0], options, (e0, v0) => {
      const v = v0.pop();
      const err = e0;
      const val = {
        ...v,  // Return the value of the last expression.
      };
      resume(err, val);
    });
  }

}

export const compiler = new BasisCompiler({
  langID: 151,
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
