import { isShieldRule } from 'nexus-shield/dist/utils'
import { ShieldRuleFieldMap } from './settings'

/**
 *
 * @param x
 *
 * Determines whether a certain field is rule field map or not.
 *
 */
export function isShieldRuleFieldMap(x: any): x is ShieldRuleFieldMap<any> {
  return (
    typeof x === 'object' &&
    Object.values(x).every((rule) => isShieldRule(rule))
  )
}
