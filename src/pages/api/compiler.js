/* Copyright (c) 2023, Artcompiler Inc */
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

export class Checker extends BasisChecker {
  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }

  PRICES(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }

  SHIPPING(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = node;
        resume(err, val);
      });
    });
  }
}

const decimalFromDollar = str => Number.parseFloat(str.slice(str.indexOf("$") + 1)).toFixed(2);

const shippingCostByWt = ({ shipping, wt }) => {
  const { UPS_Resi_SC: cost } = shipping.rows.find(row => row.Wt === Math.ceil(wt)) || {};
  return decimalFromDollar(cost);
};

const shippingCostByQty = ({ shipping, wt, qty }) => {
  const itemShipping = new Array(8).fill(0).map((elt, index) => (shippingCostByWt({ shipping, wt }) * (index + 1)).toFixed(2));
  console.log("itemShipping=" + JSON.stringify(itemShipping));
  return itemShipping;
}

const itemPriceFromQty = ({ pricing, qty }) => {
  return decimalFromDollar(qty < pricing.BULK && pricing.PRICE || pricing.BULK_PRICE);
};

const itemPricesByQty = ({ pricing, qty }) => {
  const itemPrices = new Array(8).fill(0).map((elt, index) => (itemPriceFromQty({ pricing, qty: index + 1 }) * (index + 1)).toFixed(2));
  console.log("itemPrices=" + JSON.stringify(itemPrices));
  return itemPrices;
}

const computeProfit = ({ shipping, items, prices, shippingCharge, freeShippingBreak }) => {
  const shippingCosts = shippingCostByQty({ shipping, wt: items.rows[0].Wt, qty: 8 })
  const itemsPrices = itemPricesByQty({ pricing: prices.rows[0], qty: 8 })
  // shippingPrice = itemsPrices < freeShippingBreak && shippingCharge || 0
  // profit = orderPrice + shippingPrice - shippingCost - lcogs - pkgCost
  // margin = profit / (lcogs * qty)
  // profits = items.map((item, index) => {
  //   return {
  //     item: item.name,
  //   };
  // });
  return;
};

export class Transformer extends BasisTransformer {
  ITEMS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = {
          ...v1,
          items: v0,
        };
        resume(err, val);
      });
    });
  }

  PRICES(node, options, resume) {
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

  SHIPPING(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      this.visit(node.elts[1], options, async (e1, v1) => {
        const err = [];
        const val = {
          ...v1,
          shipping: v0,
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
        profits: computeProfit(v),
      };
      resume(err, val);
    });
  }

}

export const compiler = new BasisCompiler({
  langID: 150,
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
