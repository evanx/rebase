const _redis = require('redis')
const rtx = require('multi-exec-async')
const propper = require('./propper')
const logger = require('./logger')
const spec = require('./spec')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const koa = new Koa()
const state = {
    pending: new Map()
}

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
        const [pending] = await rtx(state.client, tx => {
            tx.incrby(`hreq:pending:i`, 1)
            tx.hmset(`hreq:${requestId}:h`,
                'method', ctx.method,
                'host', ctx.host,
                'path', ctx.path,
                'headers', JSON.stringify(ctx.headers),
                'query', JSON.stringify(ctx.query)
            )
            tx.expire(`hreq:${requestId}:h`, props.responseTimeoutSeconds)
            if (ctx.request.body) {
                tx.hset(`hreq:${requestId}:h`,
                    'body', JSON.stringify(ctx.request.body)
                )
            }
            if (process.env.NODE_ENV === 'production') {
                tx.del(`hres:${requestId}:h`)
            }
        })
        return new Promise((resolve, reject) => {
            const blocker = state.client.duplicate()
            blocker.brpop(`hres:${requestId}:q`, props.responseTimeoutSeconds, (err, result) => {
                blocker.end(false)
                rtx(state.client, tx => {
                    tx.incrby(`hreq:pending:i`, -1)
                })
                if (err) {
                    reject(err)
                } else if (!result) {
                    ctx.status = 504
                    ctx.body = 'Gateway Timeout'
                    resolve()
                } else {
                    rtx(state.client, tx => {
                        tx.hgetall(`hres:${requestId}:h`)
                    }).then(results => {
                        const [ res ] = results
                        if (!res.status) {
                            ctx.status = 500
                            ctx.body = `Response missing status`
                        }
                        ctx.status = parseInt(res.status)
                        if (res.body) {
                            ctx.body = res.body
                        } else if (ctx.status === 200) {
                            ctx.status = 500
                            ctx.body = `Response missing body`
                        }
                        resolve()
                    }).catch(err => {
                        reject(err)
                    })
                }
            })
        })
    })
    state.server = state.koa.listen(props.http.port);
}

start(propper(spec)).catch(err => {
    console.error(err)
    shutdown()
})

