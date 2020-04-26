import { PluginEntrypoint } from 'nexus/plugin'
import { Settings } from './settings'

export {
  IRule,
  IRules,
  allow,
  and,
  chain,
  deny,
  inputRule,
  not,
  or,
  rule,
} from 'graphql-shield'

export const shield: PluginEntrypoint<Settings, 'required'> = (settings) => ({
  settings,
  packageJsonPath: require.resolve('../package.json'),
  runtime: {
    module: require.resolve('./runtime'),
    export: 'plugin',
  },
})
