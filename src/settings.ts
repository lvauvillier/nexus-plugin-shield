import { GetGen } from '@nexus/schema/dist/core'
import { ShieldRule } from 'nexus-shield/dist/rules'
import { ShieldPluginSettings } from 'nexus-shield/dist/config'

type GenTypes = Extract<keyof GetGen<'fieldTypes'>, string>
type GenFields<T extends GenTypes> = Extract<
  keyof GetGen<'fieldTypes'>[T],
  string
>

export type ShieldRules = ShieldRule<any, any> | ShieldRuleTypeMap

export type ShieldRuleTypeMap = {
  [T in GenTypes]?:
    | ShieldRule<any, any> /*ShieldRule<T, any>*/
    | ShieldRuleFieldMap<T>
}

export type ShieldRuleFieldMap<T extends GenTypes> = {
  [F in GenFields<T>]?: ShieldRule<any, any> /*ShieldRule<T, F>*/
} & {
  '*'?: ShieldRule<T, any>
}

interface SettingsOptions extends ShieldPluginSettings {
  debug?: boolean
  allowExternalErrors?: boolean
}

export interface Settings {
  rules: ShieldRules
  options?: SettingsOptions
}
