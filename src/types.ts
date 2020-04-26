import { GraphQLResolveInfo } from 'graphql'

export interface ISettings {
  rules: IRuleTypeMap
  options?: IOptions
}

export interface IRuleTypeMap {
  [key: string]: IRuleFunction | IRuleFieldMap
}

export interface IRuleFieldMap {
  [key: string]: IRuleFunction
}

export type IRuleFunction = (
  parent: any,
  args: any,
  ctx: any,
  info: GraphQLResolveInfo
) => IRuleResult | Promise<IRuleResult>

export type IRuleResult = boolean | string | Error

export interface IOptions {
  fallbackRule?: IRuleFunction
}
