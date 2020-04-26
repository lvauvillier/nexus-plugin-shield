import { GraphQLResolveInfo } from 'graphql'

export interface IRuleTypeMap {
  [key: string]: {
    [key: string]: IRuleFunction
  }
}

export type IRuleFunction = (
  parent: any,
  args: any,
  ctx: any,
  info: GraphQLResolveInfo
) => IRuleResult | Promise<IRuleResult>

export type IRuleResult = boolean | string | Error
