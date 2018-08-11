module.exports = {
    props: {
        redis: {
            prefix: 'test:remake:',
            port: 6379,
            host: 'localhost',
        },
        http: {
            port: 8888,

        }
    }

}