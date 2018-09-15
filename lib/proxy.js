const redis = require('redis')
const rtx = require('multi-exec-async')
const environer = require('./respec')
const logger = require('./logger')
const spec = require('./spec')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const koa = new Koa()
const state = {
   pending: new Map()
}

const commands = ['xadd', 'xread']
commands.map(command => redis.add_command(command))

const shutdown = async () => {
   if (state.server) {
      state.server.close()
   }
   if (state.client) {
      state.client.end(true)
   }
   if (state.subscriber) {
      state.subscriber.end(true)
   }
}

const start = async spec => {
   state.client = redis.createClient(spec.redis)
   const [instanceId] = await rtx(state.client, tx => {
      tx.hincrby('service', 'instance', 1)
   })
   state.subscriber = state.client.duplicate()
   state.subscriber.on('message', (channel, message) => {
      const notifier = state.pending.get(message)
      if (typeof notifier === 'function') {
         notifier()
      }
   })
   state.subscriber.subscribe(`${spec.redis.prefix}hres:ch`)
   Object.assign(state, { instanceId, koa })
   koa.use(bodyParser())
   koa.use(async ctx => {
      const req = {
         method: ctx.req.method,
         path: ctx.path,
         headers: ctx.req.headers,
         query: ctx.query
      }
      const [requestId] = await rtx(state.client, tx => {
         tx.incr('hreq:i')
      })
      const [pending] = await rtx(state.client, tx => {
         tx.incrby(`hreq:pending:i`, 1)
         tx.hmset(
            `hreq:${requestId}:h`,
            'method',
            ctx.method,
            'host',
            ctx.host,
            'path',
            ctx.path,
            'headers',
            JSON.stringify(ctx.headers),
            'query',
            JSON.stringify(ctx.query)
         )
         tx.expire(`hreq:${requestId}:h`, spec.responseTimeoutSeconds)
         if (ctx.request.body) {
            tx.hset(
               `hreq:${requestId}:h`,
               'body',
               JSON.stringify(ctx.request.body)
            )
         }
         if (process.env.NODE_ENV === 'production') {
            tx.del(`hres:${requestId}:h`)
         }
         tx.lpush(`hreq:q`, requestId)
      })
      return new Promise((resolve, reject) => {
         const timeoutId = setTimeout(() => {
            state.pending.delete(requestId)
            rtx(state.client, tx => {
               tx.incrby(`hreq:pending:i`, -1)
            })
            ctx.status = 504
            ctx.body = 'Gateway Timeout'
            logger.debug('timeout', {
               status: ctx.status,
               body: ctx.body,
               requestId
            })
            resolve()
         }, spec.responseTimeoutSeconds * 1000)
         state.pending.set(requestId.toString(), async () => {
            state.pending.delete(requestId)
            clearTimeout(timeoutId)
            await rtx(state.client, tx => {
               tx.incrby(`hreq:pending:i`, -1)
            })
            const [res] = await rtx(state.client, tx => {
               tx.hgetall(`hres:${requestId}:h`)
            })
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
            logger.debug('ok', {
               status: ctx.status,
               body: ctx.body,
               requestId
            })
            resolve()
         })
         logger.debug('pending', { size: state.pending.size, requestId })
      })
   })
   state.server = state.koa.listen(spec.http.port)
}

start(spec).catch(err => {
   console.error(err)
   shutdown()
})
