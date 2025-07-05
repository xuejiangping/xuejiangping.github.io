const { ws_router: router } = require('../router/index.js')
// const fs = require('fs/promises')
// const path = require('path')
// const cheerio = require('cheerio');
// const { TextDecoder } = require("util");
// // const soundHound = require('../../../../网易云/NeteaseCloudMusic-Audio-Recognize/index.js')
// const decoder = new TextDecoder()
function broadcast(ws) {
  ws.clients.forEach(client => {
    client.send(JSON.stringify({ msg: new Date().toLocaleString() }))
  })
}
router.get('/test',(req,res) => {
  res.end('999')
})
