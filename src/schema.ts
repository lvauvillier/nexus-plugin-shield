import { plugin } from '@nexus/schema'
import { ISettings, IRuleFunction } from './types'
import { isRuleFieldMap, isRuleFunction } from './utils'
import { allow } from './rules'

function schemaPlugin(settings: ISettings) {
  return plugin({
    name: 'Nexus Schema Shield Plugin',
    onCreateFieldResolver(config) {
      const parentTypeName = config.parentTypeConfig.name
      const fieldName = config.fieldConfig.name

      const typeRules = settings.rules[parentTypeName]

      if (!typeRules) {
        return
      }

      let rule: IRuleFunction

      if (isRuleFieldMap(typeRules)) {
        rule =
          typeRules[fieldName] ||
          typeRules['*'] ||
          settings.options?.fallbackRule ||
          allow
      } else if (isRuleFunction(typeRules)) {
        rule = typeRules
      } else {
        rule = settings.options?.fallbackRule || allow
      }

      return async (root, args, ctx, info, next) => {
        const result = rule(root, args, ctx, info)

        if (result === false) {
          throw new Error('Not Authorised!')
        } else if (result instanceof Error) {
          throw result
        } else if (typeof result === 'string') {
          throw new Error(result)
        }

        return await next(root, args, ctx, info)
      }
    },
  })
}

export { schemaPlugin }
