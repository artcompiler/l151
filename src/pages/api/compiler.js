/* Copyright (c) 2023, Artcompiler Inc */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

export class Checker extends BasisChecker {
  TABLE(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }

}

export class Transformer extends BasisTransformer {
  TABLE(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = {
          ...v1,
          prices: v0,
        };
        resume(err, val);
      });
    });
  }

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
