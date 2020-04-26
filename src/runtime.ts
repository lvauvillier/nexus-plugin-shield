import { RuntimePlugin } from 'nexus/plugin'
import { Settings } from './settings'
import { schemaPlugin } from './schema'

export const plugin: RuntimePlugin<Settings, 'required'> = (settings) => (
  project
) => {
  return {
    schema: {
      plugins: [schemaPlugin(settings)],
    },
  }
}
