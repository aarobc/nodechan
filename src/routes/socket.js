

var thrl = require('../threadList.js')()
module.exports = (server) => {

    var express   = require('express')
    var app       = express()
    var expressWS = require('express-ws')(app, server)
    module.router = express.Router()

    module.app = app
    module.router.ws('/', (ws, req) => {

        thrl.setReport(ws)

        ws.on('message', msg => {

            var message = JSON.parse(msg)
            console.log(message)
            // thrl.testS(ws)
            // thrl.runScan('wsg')
            // .then(scan => {
            //     console.log(scan)
            //     return "nop"
                var done = {msg: 'done', done: true}
                ws.send(JSON.stringify(done))
            // })

        })
    })
    return module
}

