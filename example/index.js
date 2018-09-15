const httpHandlers = require('../lib/handlers/index.js')

module.exports = {
    spec: {
        type: 'http-server',
        version: 1,
        redis: {
            prefix: 'mk:',
        },
        responseTimeoutSeconds: 3,
        popTimeoutSeconds: 4,
    },
    services: [
        {
            id: 'users'
        }
    ],
    routes: [
        {
            path: '/allo',
            method: 'get',
            handler({req}) {
                return {
                    status: 200,
                    contentType: 'application/json',
                    body: {
                        path: req.path
                    }
                }
            }
        },
        {
            path: '/users/:id',
            method: 'get',
            handler: httpHandlers.get({ table: 'user' })
        },
        {
            path: '/users',
            method: 'post',
            handler: httpHandlers.create({ table: 'user' })
        },
    ],
    async router(ctx) {
        const { spec, logger, req } = ctx
        if (req.path === '/hello') {
            return {
                status: 200,
                contentType: 'application/json',
                body: {
                    message: 'router',
                    spec
                }
            }
        }
        return require('./handlers/home.js')(ctx)
    },
    shutdown({ spec, exit, error }) {
        exit()
    }
}