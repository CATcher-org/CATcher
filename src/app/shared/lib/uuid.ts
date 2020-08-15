// https://github.com/kelektiv/node-uuid#version-4
import { randomBytes as nodeCryptoGetRandomBytes } from 'crypto';

const guid = require('uuid/v4') as (options?: { random?: Buffer }) => string;

export function uuid() {
  return guid({ random: nodeCryptoGetRandomBytes(16) });
}
