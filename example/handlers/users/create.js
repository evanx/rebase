const rtx = require('multi-exec-async')
const uuidV4 = require('uuid/v4');
const Array_flat = require('array-flatten')

module.exports = options => {
    return async ({ logger, client, req, spec }) => {
        if (!req.body.id) {
            req.body.id = uuidV4()
        }
        await rtx(client, tx => {
            tx.hmset(`${options.table}:${req.body.id}:h`, Array_flat(Object.entries(req.body)))
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