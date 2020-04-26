import { RuntimePlugin } from 'nexus/plugin'
import { IRuleTypeMap } from './types'
import { schemaPlugin } from './schema'

export const plugin: RuntimePlugin<IRuleTypeMap, 'required'> = (ruleTree) => (
  project
) => {
  return {
    schema: {
      plugins: [schemaPlugin(ruleTree)],
    },
  }
}
