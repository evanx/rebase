const rtx = require('multi-exec-async')
const uuid = require('uuid/v4')
const flatten = require('array-flatten')

module.exports = async ({ logger, client, req, spec }, table) => {
   const id = req.body.id || uuid()
   const fields = Object.keys(req.body)
   const [time, hmget] = await rtx(client, tx => {
      tx.time()
      tx.hmget(`${table.name}:${id}:h`, flatten(fields))
   })
   const [hmset] = await rtx(client, tx => {
      tx.hmset(`${table.name}:${id}:h`, flatten(Object.entries(req.body)))
      tx.lpush(
         'table:update:q',
         JSON.stringify({ time, id, hmset: req.body, hmget })
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
