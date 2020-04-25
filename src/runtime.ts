import { RuntimePlugin } from 'nexus/plugin'

export const plugin: RuntimePlugin = () => project => {
  return {
    context: {
      create: _req => {
        return {
          'nexus-plugin-shield': 'hello world!'
        }
      },
      typeGen: {
        fields: {
          'nexus-plugin-shield': 'string'
        }
      }
    }
  }
}