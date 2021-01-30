import * as chai from 'chai';
import chaiRoughly from '../chai-roughly';

import { CompressOptions, parse, stringify } from '../../src';

chai.use(chaiRoughly);

function replaceErrors(key: string, value: any) {
  if (value instanceof Error) {
    const error = ['__ERROR__', value.message]
    return error
  }
  return value
}

function reviver(_key: string, value: any) {
  if (Array.isArray(value) && value.length === 2 && value[0] === '__ERROR__')
    return new Error(value[1])
  return value
}

export function testPackUnpack(original: any, expectedCompressionOffset = 0, roughly = false, options?: CompressOptions) {
  const packed = stringify(original, options);
  const unpacked = parse(packed);

  const baseline = JSON.stringify(original, replaceErrors);
  const expected = baseline !== undefined ? JSON.parse(baseline, reviver) : undefined;
  if(roughly) {
    ;(<any>chai.expect(unpacked, 'unpacked integrity').to).roughly(0.001).deep.equal(expected);
  } else {
    ;(<any>chai.expect(unpacked, 'unpacked integrity').to).roughly().deep.equal(expected);
  }
  if(original !== undefined) {
    chai.expect(packed.length, 'compressed size').to.be.lte(baseline.length + expectedCompressionOffset);
  }
}
