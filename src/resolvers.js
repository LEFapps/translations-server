import regeneratorRuntime from 'regenerator-runtime'
import has from 'lodash/has'
import omit from 'lodash/omit'
import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'

// Required methods:
// - update (query, updateDoc)
// - findOne (query)
// - find (query)

const checkTranslator = translator => {
  if (!translator) {
    throw new Error(
      '@lefapps/translations-server expects a translator object to be supplied in the ApolloServer context'
    )
  }
  if (!isPlainObject(translator)) {
    throw new Error(
      '@lefapps/translations-server expects the translator context to be an object'
    )
  }
  if (
    !has(translator, 'find') ||
    !has(translator, 'findOne') ||
    !has(translator, 'update')
  ) {
    throw new Error(
      '@lefapps/translations-server expects the translator context to have the following methods: “find”, “findOne” and “update”'
    )
  }
  if (
    !isFunction(translator.find) ||
    !isFunction(translator.findOne) ||
    !isFunction(translator.update)
  ) {
    throw new Error(
      '@lefapps/translations-server expects the translator methods to be functions'
    )
  }
  return translator
}

export default {
  Query: {
    translate: async (_, { _id, language, params }, { translator }) => {
      translator = checkTranslator(translator)
      const result = await translator.findOne({ _id })
      if (!result) {
        translator.update({ _id }, { _id, params }) // no need to await this...
        return { _id }
      }
      const r = { _id }
      if (language) r.translation = result[language]
      if (!language) r.translations = omit(result, ['_id', 'params', 'md'])
      return r
    },
    translations: async (_, q = {}, { translator }) => {
      translator = checkTranslator(translator)
      const results = await translator.find(q)
      if (!results) return false
      return results.map(({ _id, md = false, params = [] }) => ({
        _id,
        md,
        params
      }))
    }
  },
  Mutation: {
    translated: async (_, { _id, translations, md }, { translator }) => {
      translator = checkTranslator(translator)
      const $set = { ...translations, md }
      await translator.update({ _id }, $set)
      return { _id }
    }
  }
}
