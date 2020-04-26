# nexus-plugin-shield <!-- omit in toc -->

Nexus Shield is a permission layer for your nexus application.

This project a lightweight port of [graphql-shield](https://github.com/maticzav/graphql-shield) for the nexus framework.

All credits go to the [graphql-shield](https://github.com/maticzav/graphql-shield) team.

## Project Status

- [x] Per type and per field rules
- [x] wildcard rules
- [x] custom errors
- [x] logic rules (allow, deny, and, or, not)
- [x] fallback rule
- [ ] logic rules (chain, race)
- [ ] schema validation
- [ ] caching
- [ ] fragments
- [ ] tests

## Installation

```
npm install nexus-plugin-shield
```

## Example Usage

### Setup

```typescript
// app.ts

import { use } from 'nexus'
import { shield, rule, deny, not, and, or } from 'nexus-plugin-shield'

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null
})

const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'admin'
})

const isEditor = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'editor'
})

const permissions = shield({
  rules: {
    Query: {
      frontPage: not(isAuthenticated),
      fruits: and(isAuthenticated, or(isAdmin, isEditor)),
      customers: and(isAuthenticated, isAdmin),
    },
    Mutations: {
      '*': deny,
      addFruitToBasket: isAuthenticated,
    },
  },
})

use(permissions)
```

### `shield({rules: rules, options: options})`

#### `rules`

A rule map must match your schema definition.

#### `options`

| Property     | Required | Default | Description                                        |
| ------------ | -------- | ------- | -------------------------------------------------- |
| fallbackRule | false    | allow   | The default rule for every "rule-undefined" field. |

#### Custom errors

To return custom error messages to your client, you can return error instead of throwing it. Besides returning an error you can also return a `string` representing a custom error message.

```typescript
const ruleWithCustomError = rule()(async (parent, args, ctx, info) => {
  return new Error('Custom error from rule.')
})

const ruleWithCustomErrorMessage = rule()(async (parent, args, ctx, info) => {
  return 'Custom error message from rule.'
})
```
