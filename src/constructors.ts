import { IRuleFunction } from './types'

// empty wrapper to handle future caching options
export const rule = (options: any) => (func: IRuleFunction): IRuleFunction =>
  func
