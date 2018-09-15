const assert = require('assert')
const rtx = require('multi-exec-async')

module.exports = {
   queueApp: {
      async handle({ spec, logger, client, payload }) {
         logger.debug({ payload })
      }
   }
}
