import { RuntimePlugin } from 'nexus/plugin'
import { nexusShield } from 'nexus-shield'

import { Settings } from './settings'
import { schemaPlugin } from './schema'

export const plugin: RuntimePlugin<Settings, 'required'> = (settings) => (
  project
) => {
  return {
    schema: {
      plugins: [schemaPlugin(settings), nexusShield(settings.options || {})],
    },
  }
}
