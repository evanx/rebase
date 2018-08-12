const assert = require('assert')
const clc = require('clc')

async function debug(...args) {
    console.log(...args)
}

async function info(...args) {
    console.log(...args)
}

async function warn(...args) {
    console.log(...args)
}

async function error(...args) {
    console.log(...args)
}

module.exports = {
    debug,
    info,
    warn,
    error,
}

