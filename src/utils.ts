import { IRuleFieldMap, IRuleFunction } from './types'

export function isRuleFieldMap(x: any): x is IRuleFieldMap {
  return typeof x === 'object'
}

export function isRuleFunction(x: any): x is IRuleFunction {
  return typeof x === 'function'
}
