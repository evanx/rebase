const rtx = require('multi-exec-async')

module.exports = async ({ logger, client, req, spec }, table) => {
   const [hashes] = await rtx(client, tx => {
      tx.hgetall(`${table.name}:${req.params.id}:h`)
   })
   return {
      status: 200,
      contentType: 'application/json',
      body: {
         id: req.params.id,
         hashes
      }
   }
}
