
module.exports = async ctx => {
    const { props, logger, req } = ctx
    logger.debug('router', { path: req.path })
    return require('./services/home.js')(ctx)
}
