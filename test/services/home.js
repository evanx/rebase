const service = require('../../lib/service.js') 

module.exports = service(async ({logger, req, client}) => {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            hello: 'world'
        }
    }
})