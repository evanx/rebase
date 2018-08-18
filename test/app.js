const redis = require('redis')
const propper = require('../lib/propper.js')
const logger = require('../lib/logger.js')
const consumer = require('../lib/consumer.js')
const spec = require('../lib/spec.js')
const router = require('./router.js')

const state = {}

const shutdown = async () => {
    if (state.client) {
        state.client.end(true)
    }
}

const start = async (props) => {
    state.client = redis.createClient(props.redis)
    while (true) {
        await consumer({
            props, 
            logger, 
            client: state.client, 
            service: router
        })
    }
}

start(propper(spec)).catch(err => {
    console.error(err)
    shutdown()
})