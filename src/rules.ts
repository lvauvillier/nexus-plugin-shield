import { IRuleFunction } from './types'

export const deny: IRuleFunction = (parent, args, ctx, info) => {
  return false
}

export const allow: IRuleFunction = (parent, args, ctx, info) => {
  return true
}

export function and(...rules: IRuleFunction[]): IRuleFunction {
  return async (parent, args, ctx, info) => {
    const tasks = rules.map((rule) => rule(parent, args, ctx, info))
    const results = await Promise.all(tasks)
    return results.every((res) => res === true)
  }
}

export function or(...rules: IRuleFunction[]): IRuleFunction {
  return async (parent, args, ctx, info) => {
    const tasks = rules.map((rule) => rule(parent, args, ctx, info))
    const results = await Promise.all(tasks)
    return results.some((res) => res === true)
  }
}

export function not(rule: IRuleFunction): IRuleFunction {
  return async (parent, args, ctx, info) => {
    const result = await rule(parent, args, ctx, info)
    if (result instanceof Error) {
      return true
    } else if (result !== true) {
      return true
    } else {
      return false
    }
  }
}
