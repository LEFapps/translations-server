# Translations Server (@lefapps)

This package provides building blocks for an Apollo backend to use in sync with the `@lefapps/translations` package.

## Schema

Add the typedefs and resolvers to your set:

```JS
import { makeExecutableSchema } from 'graphql-tools'
import merge from 'lodash/merge'
import {
  typedefs as Translation,
  resolvers as translationResolver
} from '@lefapps/translations-server'

const schema = makeExecutableSchema({
  typeDefs: [Translation],
  resolvers: translationResolver
})
```

## Translator

Create an object with the following methods: `find`, `findOne`, `update`. In the example below, `TRANSLATIONS` is a fictive interface to connect to your database, adapt accordingly!

```JS
const translator = {
  findOne: async ({ _id, ...query }) => await TRANSLATIONS.getOne({ _id, ...query }),
  find: async ({ query }) => await TRANSLATIONS.getAll(query),
  update: async ({ _id }, changedFields) => (
    await TRANSLATIONS.upsert(
      { _id }, // selector
      changedFields, // fields to set/update
      { upsert: true } // IMPORTANT!
    )
  )
}
```

## Apollo Server

Provide the transaltor object through the context of the Apollo Server:

```JS
import { ApolloServer } from 'apollo-server'

const server = new ApolloServer({
  schema, // see above
  context: () => ({ translator })
})
```
