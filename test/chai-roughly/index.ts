import deepEql = require('deep-eql')

const DEFAULT_TOLERANCE = 1e-6;

function comparator(left: any, right: any) {
  if (left instanceof Error && right instanceof Error) {
    return left.message === right.message
  } else {
    return null
  }
}

function comparatorWithTolerance(tolerance: number, left: any, right: any) {
  if (typeof left === 'number' && typeof right === 'number') {
    const acceptableDiff = Math.abs(tolerance * right);
    return Math.abs(right - left) <= acceptableDiff;
  } else if (left instanceof Error && right instanceof Error) {
    return left.message === right.message;
  } else {
    return null;
  }
}

export default function (chai: any, utils) {
  const Assertion = chai.Assertion;

  function assertEql(_super) {
    return function(obj, msg) {
      const tolerance = utils.flag(this, 'tolerance');
      if (tolerance) {
        if (msg) utils.flag(this, 'message', msg);
        this.assert(
          deepEql(obj, utils.flag(this, 'object'), { comparator: comparatorWithTolerance.bind(null, tolerance) })
          , 'expected #{this} to roughly deeply equal #{exp}'
          , 'expected #{this} to not roughly deeply equal #{exp}'
          , obj
          , this._obj
          , true
        );
      } else {
        if (msg) utils.flag(this, 'message', msg);
        this.assert(
          deepEql(obj, utils.flag(this, 'object'), { comparator })
          , 'expected #{this} to roughly deeply equal #{exp}'
          , 'expected #{this} to not roughly deeply equal #{exp}'
          , obj
          , this._obj
          , true
        );

        // _super.apply(this, arguments);
      }
    };
  }

  Assertion.overwriteMethod('eql', assertEql);
  Assertion.overwriteMethod('eqls', assertEql);

  function explicitRoughly(tolerance) {
    utils.flag(this, 'tolerance', tolerance);
  }

  function defaultRoughly() {
    utils.flag(this, 'tolerance', DEFAULT_TOLERANCE);
  }

  Assertion.addChainableMethod('roughly', explicitRoughly, defaultRoughly);
};