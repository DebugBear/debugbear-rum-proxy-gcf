const express = require('express')
const app = express()
const port = 4800

const proxy = require("./index")

app.get('/', (req, res) => {
  proxy.debugbearrumproxy(req, res)
})

app.listen(port, () => {
  console.log(`DebugBear dev RUM proxy listening on ${port}`)
})