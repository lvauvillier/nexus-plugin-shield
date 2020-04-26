import { plugin } from '@nexus/schema'
import { IRuleTypeMap } from './types'

function schemaPlugin(ruleTree: IRuleTypeMap) {
  return plugin({
    name: 'Nexus Schema Shield Plugin',
    onCreateFieldResolver(config) {
      const parentTypeName = config.parentTypeConfig.name
      const fieldName = config.fieldConfig.name

      if (parentTypeName != 'Query' && parentTypeName != 'Mutation') {
        return
      }

      if (!ruleTree[parentTypeName]) {
        return
      }

      const rule =
        ruleTree[parentTypeName][fieldName] || ruleTree[parentTypeName]['*']
      if (!rule) {
        return
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
