import hash from 'object-hash'
import { plugin } from '@nexus/schema'
import { Settings } from './settings'

import {
  ShieldRule,
  IOptionsConstructor,
  IOptions,
  IFallbackErrorType,
  IHashFunction,
  IShieldContext,
} from 'graphql-shield/dist/types'
import {
  isRuleFunction,
  isRuleFieldMap,
  withDefault,
} from 'graphql-shield/dist/utils'
import { allow } from 'graphql-shield'

function normalizeOptions(options: IOptionsConstructor): IOptions {
  if (typeof options.fallbackError === 'string') {
    options.fallbackError = new Error(options.fallbackError)
  }

  return {
    debug: options.debug !== undefined ? options.debug : false,
    allowExternalErrors: withDefault(false)(options.allowExternalErrors),
    fallbackRule: withDefault<ShieldRule>(allow)(options.fallbackRule),
    fallbackError: withDefault<IFallbackErrorType>(
      new Error('Not Authorised!')
    )(options.fallbackError),
    hashFunction: withDefault<IHashFunction>(hash)(options.hashFunction),
  }
}

function schemaPlugin(settings: Settings) {
  const options = normalizeOptions(settings.options || {})

  return plugin({
    name: 'Nexus Schema Shield Plugin',
    onCreateFieldResolver(config) {
      const parentTypeName = config.parentTypeConfig.name
      const fieldName = config.fieldConfig.name

      let rule: ShieldRule
      const rules = settings.rules

      if (isRuleFunction(rules)) {
        rule = rules
      } else {
        const typeRules = rules[parentTypeName]
        if (isRuleFunction(typeRules)) {
          rule = typeRules
        } else if (isRuleFieldMap(typeRules)) {
          const defaultTypeRule = typeRules['*']
          rule = withDefault(defaultTypeRule || options.fallbackRule)(
            typeRules[fieldName]
          )
        } else {
          rule = options.fallbackRule
        }
      }

      return async (root, args, ctx, info, next) => {
        // Cache
        if (!ctx) {
          ctx = {} as IShieldContext
        }

        if (!ctx._shield) {
          console.log('add !')
          ctx._shield = {
            cache: {},
          }
        }

        console.log(ctx._shield)

        // Execution
        try {
          const res = await rule.resolve(root, args, ctx, info, options)
          if (res === true) {
            return await next(root, args, ctx, info)
          } else if (res === false) {
            if (typeof options.fallbackError === 'function') {
              return await options.fallbackError(null, root, args, ctx, info)
            }
            return options.fallbackError
          } else {
            return res
          }
        } catch (err) {
          if (options.debug) {
            throw err
          } else if (options.allowExternalErrors) {
            return err
          } else {
            if (typeof options.fallbackError === 'function') {
              return await options.fallbackError(err, root, args, ctx, info)
            }
            return options.fallbackError
          }
        }
      }
    },
  })
}

export { schemaPlugin }
