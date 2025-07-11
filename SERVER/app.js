const { WriteStream,createWriteStream,readFileSync } = require("fs")
const { transformReq } = require('./utils/index.js')



const Server = {
  http: require('http'),
  https: require('https')
}

const WS = require('ws').Server
const path = require("path");
const { IncomingMessage,ServerResponse } = require("http");
const host = '0.0.0.0'
const port = 8081
const protocol = 'http'
const ws_protocol = protocol === 'http' ? 'ws' : 'wss'
const options = {
  cert: readFileSync(path.join(__dirname,'./cert/cert.pem')),
  key: readFileSync(path.join(__dirname,'./cert/key.pem'))
}
Object.assign(IncomingMessage.prototype,transformReq)


// Object.assign(ServerResponse.prototype,transformReq)

function create_http_server() {
  // 创建服务器
  const app = Server[protocol].createServer(options,(req,res) => {
    res.setHeader('Content-Type','text/html;charset=UTF-8');
    res.setHeader('access-control-allow-origin','*')
    res.setHeader('Access-Control-Allow-Headers','*')
  }).listen(port,host,() => console.log(`服务器启动成功: ${protocol}://${host}:${port}`))
    .on('request',(req,res) => {
      if (req.url.endsWith('/')) {
        res.writeHead(301,{ Location: req.url.replace(/\/$/,'') })
        res.end()
      }
      req.url = decodeURI(req.url)
      // console.log('req.url',req.url,decodeURI(req.url))
      const { searchParams,pathname } = new URL(req.url,`${protocol}://${host}:${port}`)
      Object.assign(req,{ pathname: decodeURI(pathname),searchParams })
    }).on('error',(err) => {
      console.error('服务器出错：',err)
    })

  return app
}


function broadcast(ws,data) {
  ws.clients.forEach(client => {
    client.send(data)
  })
}


function create_ws_server(app) {
  // web-socket 服务
  const ws = new WS({ server: app }).on('listening',() => {
    console.log('web-socket 服务启动：',`${ws_protocol}://${host}:${port}`)
  });
  ws.on('connection',(cne) => {
    cne.onerror = (err) => console.log('发生错误: ',err.message)
    console.log('当前连接数量：',ws.clients.size)
    cne.onclose = (e) => console.log('关闭连接: ',e.code,e.reason)
    broadcast(ws,'新连接！')
  })
  ws.on('error',(err) => broadcast(ws,'服务端发生错误！'))
  ws.on('close',err => broadcast(ws,'服务端已关闭! '))

  return ws
}


const app = create_http_server()
const ws_app = create_ws_server(app)

module.exports = { app,ws_app }