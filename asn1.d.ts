declare module 'asn1.js' {
  /*
    const asn1 = exports;

    asn1.bignum = require('bn.js');

    asn1.define = require('./asn1/api').define;
    asn1.base = require('./asn1/base');
    asn1.constants = require('./asn1/constants');
    asn1.decoders = require('./asn1/decoders');
    asn1.encoders = require('./asn1/encoders');
 */

  namespace asn1 {
    export function define(name: string, body: (this: any) => void): Entity

    class Entity {
      name: string
      body: string
      decoders: Record<string, Function>
      encoders: Record<string, Function>

      decode(data, enc, options): any
      encode(data, enc): any
    }
  }

  export = asn1
}
