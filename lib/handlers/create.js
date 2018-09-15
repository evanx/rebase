const rtx = require('multi-exec-async')
const uuid = require('uuid/v4');
const flatten = require('array-flatten')

module.exports = options => {
    return async ({ logger, client, req, spec }) => {
        if (!req.body.id) {
            req.body.id = uuid()
        }
        await rtx(client, tx => {
            tx.hmset(
                `${options.table}:${req.body.id}:h`, 
                flatten(Object.entries(req.body))
            )
        })
        return {
            status: 200,
            contentType: 'application/json',
            body: {
                post: req.body.id
            }
        }
    }
}