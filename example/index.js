module.exports = {
    spec: {
        redis: {
            prefix: 'mk:',
        },
        responseTimeoutSeconds: 3,
        popTimeoutSeconds: 4,
    },
    routes: [
        {
            path: "/allo",
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
        return require('./services/home.js')(ctx)
    },
    shutdown({ spec, exit, error }) {
        exit()
    }
}