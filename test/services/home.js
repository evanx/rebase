module.exports = async ({ logger, client, req }) => {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            hello: 'world',
            req
        }
    }
}