const assert = require('assert')

async function debug(...args) {
    console.log(...args)
}

module.exports = {
    debug,
}

