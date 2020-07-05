import hash from 'object-hash'
import { plugin } from '@nexus/schema'
import { allow } from 'nexus-shield'
import { ShieldRule, ShieldContext } from 'nexus-shield/dist/rules'
import { isShieldRule } from 'nexus-shield/dist/utils'

import { Settings } from './settings'
import { isShieldRuleFieldMap } from './utils'

function schemaPlugin(settings: Settings) {
  const options = {
    debug:
      settings.options?.debug !== undefined ? settings.options?.debug : false,
    allowExternalErrors: settings.options?.allowExternalErrors || false,
    defaultRule: settings.options?.defaultRule || allow,
    defaultError:
      settings.options?.defaultError || new Error('Not Authorised!'),
    hashFunction: settings.options?.hashFunction || hash,
  }

  return plugin({
    name: 'Nexus Schema Shield Plugin',
    onCreateFieldResolver(config) {
      const parentTypeName = config.parentTypeConfig.name
      const fieldName = config.fieldConfig.name

      let rule: ShieldRule<any, any>
      const rules = settings.rules

      if (isShieldRule(rules)) {
        rule = rules
      } else {
        const typeRules = rules[parentTypeName]
        if (isShieldRule(typeRules)) {
          rule = typeRules
        } else if (isShieldRuleFieldMap(typeRules)) {
          const defaultTypeRule = typeRules['*']
          rule = typeRules[fieldName] || defaultTypeRule || options.defaultRule
        } else {
          rule = options.defaultRule
        }
      }

      return async (root, args, ctx, info, next) => {
        // Cache
        if (!ctx) {
          ctx = {} as ShieldContext
        }

        if (!ctx._shield) {
          ctx._shield = {
            cache: {},
          }
        }

        // Execution
        try {
          const allowed = await rule.resolve(root, args, ctx, info, options)
          if (allowed === true) {
            return await next(root, args, ctx, info)
          } else if (allowed === false) {
            if (typeof options.defaultError === 'function') {
              return await options.defaultError(
                new Error(),
                root,
                args,
                ctx,
                info
              )
            }
            return options.defaultError
          } else {
            return allowed
          }
        } catch (err) {
          if (options.debug) {
            throw err
          } else if (options.allowExternalErrors) {
            return err
          } else {
            if (typeof options.defaultError === 'function') {
              return await options.defaultError(err, root, args, ctx, info)
            }
            return options.defaultError
          }
        }
      }
    },
  })
}

export { schemaPlugin }
