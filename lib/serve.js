const assert = require('assert')
const redis = require('redis')
const logger = require('./logger.js')
const popper = require('./popper.js')
const tableHandlers = require('./tables/index.js')
const pathMatcher = require('path-match')({
   sensitive: false,
   strict: false,
   end: false
})

module.exports = async ({ spec, tables, routes, router, shutdown }) => {
   const state = {}
   const exit = async code => {
      if (state.client) {
         state.client.end(true)
      }
      process.exit(code)
   }
   Object.entries(tables).map(([name, table]) => (table.name = name))
   routes.map(route =>
      Object.assign(route, {
         method: route.method.toUpperCase(),
         pathMatcher: pathMatcher(route.path)
      })
   )
   state.router = async ctx => {
      const { path, method } = ctx.req
      logger.debug({ method, path })
      if (path === '/favicon.ico') {
         return {
            status: 404
         }
      }
      const fragments = path.slice(1).split('/')
      if (fragments.length) {
         const tableKey = fragments[0]
         const table = tables[tableKey]
         if (table) {
            const handler = tableHandlers[method.toLowerCase()]
            logger.debug({ table })
            if (fragments.length === 2) {
               ctx.req.params = { id: fragments[1] }
            } else {
               ctx.req.params = {}
            }
            const res = await handler(ctx, table)
            return res
         }
      }
      if (routes) {
         assert.ok(Array.isArray(routes), 'routes array')
         const route = routes.find(
            route => route.method === method && route.pathMatcher(path)
         )
         if (route) {
            ctx.req.params = route.pathMatcher(path)
            assert.ok(
               typeof route.handler === 'function',
               `route handler for path ${route.path}`
            )
            return route.handler(ctx)
         }
      }
      return router(ctx)
   }
   try {
      state.client = redis.createClient(spec.redis)
      while (true) {
         await popper({
            spec,
            logger,
            client: state.client,
            router: state.router
         })
      }
   } catch (error) {
      console.error(error)
      if (shutdown) {
         shutdown({ spec, exit, error })
      } else {
         exit(1)
      }
   }
}
