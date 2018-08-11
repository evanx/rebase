const _redis = require('redis')
const rtx = require('multi-exec-async')
const propper = require('./propper')
const logger = require('./logger')
const spec = require('./spec')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const koa = new Koa()
const state = {}

const commands = [
    'xadd',
    'xread'
]
commands.map(command => _redis.add_command(command))

const shutdown = async () => {
    if (state.server) {
        state.server.close()
    }
    if (state.client) {
        state.client.end(true)
    }
}

const start = async props => {
    state.client = _redis.createClient(props.redis)
    const [instanceId] = await rtx(state.client, tx => {
        tx.hincrby('service', 'instance', 1)
    })
    Object.assign(state, {instanceId, koa})
    koa.use(bodyParser());
    koa.use(async ctx => {
        const req = {
            method: ctx.req.method,
            path: ctx.path,
            headers: ctx.req.headers,
            query: ctx.query,
        }
        const [requestId] = await rtx(state.client, tx => {
            tx.incr('hreq:i')
        })
        await rtx(state.client, tx => {
            tx.hmset(`hreq:${requestId}:h`,
                'method', ctx.method,
                'host', ctx.host,
                'path', ctx.path,
                'headers', JSON.stringify(ctx.headers),
                'query', JSON.stringify(ctx.query)
            )
            if (ctx.request.body) {
                tx.hset(`hreq:${requestId}:h`,
                    'body', JSON.stringify(ctx.request.body)
                )
            }
        })
        ctx.body = { req }
    })
    state.server = state.koa.listen(props.http.port);
}

start(propper(spec)).catch(err => {
    console.error(err)
    shutdown()
})

