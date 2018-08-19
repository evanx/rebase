const assert = require('assert')
const redis = require('redis')
const logger = require('./logger.js')
const popper = require('./popper.js')
const pathMatcher = require('path-match')({
    sensitive: false,
    strict: false,
    end: false,
});

module.exports = async ({ spec, routes, router, shutdown }) => {
    const state = {}
    const exit = async code => {
        if (state.client) {
            state.client.end(true)
        }
        process.exit(code)
    }
    route = routes.map(route => Object.assign(route, {
        method: route.method.toUpperCase(),
        pathMatcher: pathMatcher(route.path),
    }))
    state.router = async ctx => {
        if (routes) {
            assert.ok(Array.isArray(routes), 'routes array')
            const route = routes.find(
                route => route.method === ctx.req.method && route.pathMatcher(ctx.req.path)
            )
            if (route) {
                ctx.req.params = route.pathMatcher(ctx.req.path)
                assert.ok(typeof route.handler === 'function', `route handler for path ${route.path}`)
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
