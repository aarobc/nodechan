var express   = require('express')
var app = express()
var expressWS = require('express-ws')(app)
var router    = express.Router()

router.ws('/', (ws, req) => {
    ws.on('message', msg => {
        console.log(msg)
        ws.send(msg)
    })
})

module.exports = router
