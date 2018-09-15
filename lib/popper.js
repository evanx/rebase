const assert = require('assert')
const brpoplpush = require('brpoplpush-async')
const rtx = require('multi-exec-async')
const logger = require('./logger.js')

module.exports = async ({ spec, logger, client, router }) => {
   const requestId = await brpoplpush(
      client,
      'hreq:q',
      'hreq:p:q',
      spec.popTimeoutSeconds
   )
   if (!requestId) {
      logger.warn('No service request')
   } else {
      logger.debug({ requestId })
      const [req] = await rtx(client, tx => {
         tx.hgetall(`hreq:${requestId}:h`)
      })
      if (!req) {
         logger.warn('No request hashes', requestId)
         return
      }
      if (!req.path) {
         logger.warn('No request path', requestId, req)
         return
      }
      if (req.body) {
         req.body = JSON.parse(req.body)
      }
      const res = await router({ spec, logger, client, req })
      logger.debug({ req, res, spec })
      await rtx(client, tx => {
         tx.hset(`hres:${requestId}:h`, 'status', res.status)
         if (res.body) {
            tx.hset(`hres:${requestId}:h`, 'body', JSON.stringify(res.body))
         }
         tx.hset(`hres:${requestId}:h`, 'status', res.status)
         tx.expire(`hres:${requestId}:h`, spec.responseTimeoutSeconds)
         tx.publish(`${spec.redis.prefix}hres:ch`, requestId)
      })
   }
}
