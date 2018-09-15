const assert = require('assert')
const redis = require('redis')
const brpoplpush = require('brpoplpush-async')
const logger = require('./logger.js')
const config = {
   popTimeoutSeconds: 99
}

const assertSpec = spec => {
   assert(spec.redis, 'redis')
   assert(spec.queueApp, 'queueApp')
   assert(spec.queueApp.incoming, 'queueApp.incoming')
   assert(spec.queueApp.pending, 'queueApp.pending')
}

const assertApp = app => {
   assert(app.queueApp, 'queueApp')
   assert(app.queueApp.handle, 'queueApp.handle')
}

module.exports = async (spec, app) => {
   const state = {}
   const exit = async code => {
      if (state.client) {
         state.client.end(true)
      }
      process.exit(code)
   }
   try {
      assertSpec(spec)
      assertApp(app)
      state.client = redis.createClient(spec.redis)
      while (true) {
         const payloadJson = await brpoplpush(
            state.client,
            spec.queueApp.incoming,
            spec.queueApp.pending,
            config.popTimeoutSeconds
         )
         if (!payloadJson) {
            logger.debug('pop', spec)
            continue
         }
         const payload = JSON.parse(payloadJson)
         logger.debug('handle', payload)
         await app.queueApp.handle({
            spec,
            logger,
            client: state.client,
            payload
         })
      }
   } catch (error) {
      console.error(error)
      if (app.shutdown) {
         app.shutdown({ spec, exit, error })
      } else {
         exit(1)
      }
   }
}
