# nexus-plugin-shield

Nexus plugin Shield helps you create a permission layer for your nexus application.

If your project only rely on `@nexus/schema`, you should directly use [nexus-shield](https://github.com/Sytten/nexus-shield)

## Table of contents

- [Installation](#installation)
  - [Setup](#setup)
  - [Plugin options](#shieldrules-rules-options-options)
- [Rules](#rules)
  - [Definition](#definition)
  - [Operators](#operators)
  - [caching](#caching)
- [Schema](#schema)
  - [Shield Parameter](#shield-parameter)
  - [Type safety](#type-safety)
  - [Generic rules](#generic-rules)

## Installation

```
npm install nexus-plugin-shield
```

### Setup

```typescript
// app.ts

import { use } from 'nexus'
import {
  shield,
  ShieldCache,
  rule,
  deny,
  not,
  and,
  or,
} from 'nexus-plugin-shield'

const isAuthenticated = rule({ cache: ShieldCache.CONTEXTUAL })(
  async (parent, args, ctx: NexusContext, info) => {
    return ctx.user !== null
  }
)

const isAdmin = rule({ cache: ShieldCache.CONTEXTUAL })(
  async (parent, args, ctx: NexusContext, info) => {
    return ctx.user.role === 'admin'
  }
)

const isEditor = rule({ cache: ShieldCache.CONTEXTUAL })(
  async (parent, args, ctx: NexusContext, info) => {
    return ctx.user.role === 'editor'
  }
)

const permissions = shield({
  rules: {
    Query: {
      frontPage: not(isAuthenticated),
      fruits: and(isAuthenticated, or(isAdmin, isEditor)),
      customers: and(isAuthenticated, isAdmin),
    },
    Mutations: {
      addFruitToBasket: isAuthenticated,
    },
    Fruit: isAuthenticated,
    Customer: isAdmin,
  },
  options: {
    defaultRule: deny,
  },
})

use(permissions)
```

### `shield({rules: rules, options: options})`

#### `rules`

A rule map must match your schema definition.
You can define global, per Type, or per Field rules.

#### `options`

| Property            | Required | Default                                              | Description                                             |
| ------------------- | -------- | ---------------------------------------------------- | ------------------------------------------------------- |
| allowExternalErrors | false    | false                                                | Toggle catching internal errors.                        |
| debug               | false    | false                                                | Toggle debug mode.                                      |
| defaultRule         | false    | allow                                                | Rule that is used if none is specified for a field      |
| defaultError        | false    | Error('Not Authorised!')                             | Error Permission system fallbacks to.                   |
| hashFunction        | false    | [object-hash](https://github.com/puleos/object-hash) | Function used to hash the input to provide caching keys |

### Per Type default Rule

There is an option to specify a rule that will be applied to all fields of a type (`Query`, `Mutation`, ...) that do not specify a rule.
It is similar to the `options.defaultRule` but allows you to specify a `defaultRule` per type.

```ts
const permissions = shield({
  Query: {
    "*": deny
    query1: allow,
    query2: allow,
  },
  Mutation: {
    "*": deny
  },
}, {
  fallbackRule: allow
})
```

## Rules

### Definition

Two interfaces styles are provided for convenience: `Graphql-Shield` and `Nexus`.

#### Graphql-Shield

```typescript
rule()((root, args, ctx) => {
  return !!ctx.user
})
```

#### Nexus

```typescript
ruleType({
  resolve: (root, args, ctx) => {
    return !!ctx.user
  },
})
```

#### Error

- A rule needs to return a `boolean`, a `Promise<boolean>` or throw an `Error`.
- If `false` is returned, the configured `defaultError` will be thrown by the plugin.

```typescript
const isAuthenticated = ruleType({
  resolve: (root, args, ctx) => {
    const allowed = !!ctx.user
    if (!allowed) throw new Error('Bearer token required')
    return allowed
  },
})
```

### Caching

- The result of a rule can be cached to maximize performances. This is important when using generic or partial rules that require access to external data.
- The caching is **always** scoped to the request

The plugin offers 3 levels of caching:

- `NO_CACHE`: No caching is done (default)
- `CONTEXTUAL`: Use when the rule only depends on the `ctx`
- `STRICT`: Use when the rule depends on the `root` or `args`

Usage:

```typescript
rule({ cache: ShieldCache.STRICT })((root, args, ctx) => {
  return true
})

ruleType({
  cache: ShieldCache.STRICT,
  resolve: (root, args, ctx) => {
    return !!ctx.user
  },
})
```

### Operators

Rules can be combined in a very flexible manner. The plugin provides the following operators:

- `and`: Returns `true` if **all** rules return `true`
- `or`: Returns `true` if **one** rule returns `true`
- `not`: Inverts the result of a rule
- `chain`: Same as `and`, but rules are executed in order
- `race`: Same as `or`, but rules are executed in order
- `deny`: Returns `false`
- `allow`: Returns `true`

Simple example:

```typescript
import { chain, not, ruleType } from 'nexus-shield'

const hasScope = (scope: string) => {
  return ruleType({
    resolve: (root, args, ctx) => {
      return ctx.user.permissions.includes(scope)
    },
  })
}

const backlist = ruleType({
  resolve: (root, args, ctx) => {
    return ctx.user.token === 'some-token'
  },
})

const viewerIsAuthorized = chain(
  isAuthenticated,
  not(backlist),
  hasScope('products:read')
)
```

## Schema

### Shield parameter

Rules can also be be applyed at schema level.
To use a rule, it must be assigned to the `shield` parameter of a field:

```typescript
export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.id('id')
    t.string('prop', {
      shield: ruleType({
        resolve: (root, args, ctx) => {
          return !!ctx.user
        },
      }),
    })
  },
})
```

### Type safety

This plugin will try its best to provide typing to the rules.

- It is **preferable** to define rules directly in the `definition` to have access to the full typing of `root` and `args`.
- The `ctx` is always typed if it was properly configured in nexus `makeSchema`.
- If creating generic or partial rules, use the appropriate helpers (see below).

```typescript
export type Context = {
  user?: { id: string }
}

export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.id('id')
    t.string('ownerId')
    t.string('prop', {
      args: {
        filter: stringArg({ nullable: false }),
      },
      shield: ruleType({
        resolve: (root, args, ctx) => {
          // root => { id: string }, args => { filter: string }, ctx => Context
          return true
        },
      }),
    })
  },
})
```

#### Generic rules

- Generic rules are rules that do not depend on the type of the `root` or `args`.
- The wrapper `generic` is provided for this purpose. It will wrap your rule in a generic function.

```typescript
const isAuthenticated = generic(
  ruleType({
    resolve: (root, args, ctx) => {
      // Only ctx is typed
      return !!ctx.user
    },
  })
)

// Usage
t.string('prop', {
  shield: isAuthenticated(),
})
```

#### Partial rules

- Generic rules are rules that depend only on the type of the `root`.
- The wrapper `partial` is provided for this purpose. It will wrap your rule in a generic function.

```typescript
const viewerIsOwner = partial(
  ruleType({
    type: 'Product' // It is also possible to use the generic parameter of `partial`
    resolve: (root, args, ctx) => {
      // Both root and ctx are typed
      return root.ownerId === ctx.user.id;
    },
  })
);

// Usage
t.string('prop', {
  shield: viewerIsOwner(),
});
```

#### Combining rules

If you mix and match generic rules with partial rules, you will need to specify the type in the parent helper.

```typescript
const viewerIsAuthorized = partial<'Product'>(
  chain(isAuthenticated(), viewerIsOwner())
)
```

However, if you specify it directly in the `shield` field, there is not need for an helper thus no need for a parameter.

```typescript
t.string('prop', {
  shield: chain(isAuthenticated(), viewerIsOwner()),
})
```
