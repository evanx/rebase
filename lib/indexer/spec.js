module.exports = {
   redis: {
      prefix: 'rb:',
      port: 6379,
      host: 'localhost'
   },
   queueApp: {
      incoming: 'table:update:q',
      pending: 'table:update:p:q'
   }
}
