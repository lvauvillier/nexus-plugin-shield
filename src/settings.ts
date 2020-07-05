import { IOptionsConstructor, ShieldRule } from 'graphql-shield/dist/types'
import { GetGen } from '@nexus/schema/dist/core'

type GenTypes = Extract<keyof GetGen<'fieldTypes'>, string>
type GenFields<T extends GenTypes> = Extract<
  keyof GetGen<'fieldTypes'>[T],
  string
>

export type IRuleTypeMap = {
  [T in GenTypes]?: ShieldRule | IRuleFieldMap<T>
}
export type IRuleFieldMap<T extends GenTypes> = {
  [F in GenFields<T>]?: ShieldRule
} & {
  '*'?: ShieldRule
}
export declare type IRules = ShieldRule | IRuleTypeMap

export interface Settings {
  rules: IRules
  options?: IOptionsConstructor
}
