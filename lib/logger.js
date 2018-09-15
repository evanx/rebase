const assert = require('assert')
const clc = require('cli-color')

async function debug(...args) {
   console.log(clc.cyan('debug'), ...args)
}

async function info(...args) {
   console.log(clc.magenta('debug'), ...args)
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
   error
}
