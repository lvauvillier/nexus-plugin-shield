import { RuntimePlugin } from 'nexus/plugin'
import { ISettings } from './types'
import { schemaPlugin } from './schema'

export const plugin: RuntimePlugin<ISettings, 'required'> = (settings) => (
  project
) => {
  return {
    schema: {
      plugins: [schemaPlugin(settings)],
    },
  }
}
