module.exports = {
    props: {
        redis: {
            prefix: 'mk:',
            port: 6379,
            host: 'localhost',
        },
        http: {
            port: 8888,

        },
        responseTimeoutSeconds: 3,
        popTimeoutSeconds: 4,
    }

}