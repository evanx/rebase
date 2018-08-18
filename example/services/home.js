const rtx = require('multi-exec-async')

module.exports = async ({ logger, client, req, spec }) => {
    const info = await rtx(client, tx => tx.info)
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            welcome: 'home',
            req,
            spec,
            info
        }
    }
}