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

const decimalFromDollar = str => str !== undefined ? Number.parseFloat(str.slice(str.indexOf("$") + 1)) : undefined;

const shippingCostByWt = ({ shipping, wt }) => {
  const { UPS_Resi_SC: cost } = shipping.rows.find(row => row.Wt === Math.ceil(wt)) || {};
  return decimalFromDollar(cost);
};

const shippingCostByQty = ({ shipping, wt, qty }) => {
  const itemShipping = new Array(8).fill(0).map((elt, index) =>
    shippingCostByWt({ shipping, wt: wt * (index + 1) }));
  return itemShipping;
}

const itemPriceFromQty = ({ pricing, qty }) => {
  return decimalFromDollar(qty < pricing.BULK && pricing.PRICE || pricing.BULK_PRICE);
};

const itemPricesByQty = ({ pricing, qty }) => {
  const itemPrices = new Array(8).fill(0).map((elt, index) => (itemPriceFromQty({ pricing, qty: index + 1 }) * (index + 1)));
  return itemPrices;
}

const shippingPricesByQty = ({ itemPrices, shippingFee, shippingBreak }) => {
  return itemPrices.map(price => +price < +shippingBreak && shippingFee || 0);
}

const itemCogsByQty = ({ item, qty }) => {
  const itemCogs = new Array(8).fill(0)
        .map((elt, index) =>
          decimalFromDollar(item.LCOGS) * (index + 1));
  return itemCogs;
}

const itemCostsByQty = ({ itemCogs, shippingCosts, pkgCost, qty }) => {
  const itemCosts = itemCogs
        .map((cogs, index) =>
          cogs +
            decimalFromDollar(pkgCost) +
            shippingCosts[index]);
  return itemCosts;
}

const itemProfitsByQty = ({ itemPrices, shippingPrices, itemCosts }) =>
  itemCosts.map((itemCost, index) =>
    (+itemPrices[index] + +shippingPrices[index] - +itemCost));

const computeProfit = ({ shipping, items, prices, shippingFee, shippingBreak }) => {
  shippingFee = shippingFee || "12.95";
  shippingBreak = "30.00";
  // Compute the profit for all items and all quatities.
  const profits = items.rows.map((item, index) => {
    const pricing = prices.rows[index];
    const shippingCosts = shippingCostByQty({ shipping, wt: item.Wt, qty: 8 })
    const itemPrices = itemPricesByQty({ pricing, qty: 8 })
    const shippingPrices = shippingPricesByQty({ itemPrices, shippingFee, shippingBreak });
    const itemCogs = itemCogsByQty({ item, qty: 8 });
    const itemCosts = itemCostsByQty({ itemCogs, shippingCosts, pkgCost: item.Pkg_Cost, qty: 8 });
    const itemProfits = itemProfitsByQty({ itemPrices, shippingPrices, itemCosts });
    //  const   orderPrice + shippingPrice - shippingCost - itemCost;
    // margin = profit / (lcogs * qty)
    const itemPM = itemProfits.map((itemProfit, index) => {
      return {
        item: item.Desc,
        quantity: index + 1,
        profit: itemProfit,
        margin: itemProfit / itemCogs[index],
      };
    });
    return itemPM;
  });
  return profits.flat();
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
