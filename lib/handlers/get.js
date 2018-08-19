const rtx = require('multi-exec-async')

module.exports = options => {
    return async ({ logger, client, req, spec }) => {
        const [hashes] = await rtx(client, tx => {
            tx.hgetall(
                `${options.table}:${req.params.id}:h`
            )
        })
        return {
            status: 200,
            contentType: 'application/json',
            body: {
                id: req.params.id,
                hashes,
            }
        }
    }
}