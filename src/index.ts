import { PluginEntrypoint } from 'nexus/plugin'
import { IRuleTypeMap } from './types'

export { rule } from './constructors'
export { allow, deny, and, not, or } from './rules'

export const shield: PluginEntrypoint<IRuleTypeMap, 'required'> = (
  settings
) => ({
  settings,
  packageJsonPath: require.resolve('../package.json'),
  runtime: {
    module: require.resolve('./runtime'),
    export: 'plugin',
  },
})
