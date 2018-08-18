const assert = require('assert')
const brpoplpush = require('brpoplpush-async')
const rtx = require('multi-exec-async')


module.exports = async ({ spec, logger, client, router }) => {
    const requestId = await brpoplpush(client, 'hreq:q', 'hreq:p:q', spec.popTimeoutSeconds)
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
        logger.debug({ req })
        const res = await router({ spec, logger, client, req })
        await rtx(client, tx => {
            tx.hset(`hres:${requestId}:h`, 'status', res.status)
            tx.hset(`hres:${requestId}:h`, 'body', JSON.stringify(res.body))
            tx.publish(`${spec.redis.prefix}hres:ch`, requestId)
        })
    }
}