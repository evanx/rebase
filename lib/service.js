const redis = require('redis')
const rtx = require('multi-exec-async')
const propper = require('./propper')
const logger = require('./logger')
const spec = require('./spec')

const state = {

}

const servicer = async service => {
    state.props = propper(spec)
    state.client = redis.createClient(state.props.redis)
    return async () => {
        const requestId = await state.client.rpoplpush(`hreq:q`, `hreq:p:q`, state.props.popTimeoutSeconds) 
        if (!requestId) {
            logger.warn('Missing service request')
        } else {
            const [req] = await rtx(state.client, tx => tx.hgetall(`hreq:${requestId}:h`))
            logger.debug({req})
            service(Object.assign({logger, req}, state))
        }
    }
}

module.exports = servicer