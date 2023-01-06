const { WriteStream,createWriteStream } = require("fs")
const http = require('http');
const websocket = require("nodejs-websocket");
const { parse: parseURL } = require("url");
const { proxy,onSaveHook,baike } = require("./route/index");
const path = require("path");
const host = '192.168.199.208'
// websocket 服务
const ws = websocket.createServer(function (conn) {
  conn.on('error',err => console.log('发生错误',err.message))
  conn.on('close',() => console.log('当前连接人数：',ws.connections.length))
  console.log('当前连接人数：',ws.connections.length)
}).listen(9001,host,() => console.log('websocket 服务启动'))
function broadcast(msg) {
  ws.connections.forEach(conn => conn.sendText(msg))
}




const router = {}
router['/baike'] = baike
router['/proxy'] = proxy
router['/onSaveHook'] = (req,res) => onSaveHook(req,res,broadcast)


// 创建服务器
http.createServer((req,res) => {
  res.setHeader('Content-Type','text/html;charset=UTF-8')
  res.setHeader('access-control-allow-origin','*')
  res.setHeader('Access-Control-Allow-Headers','*')

}).listen(9000,() => console.log('服务器启动成功: http://localhost:9000'))
  .on('request',(req,res) => {
    const { pathname,query } = parseURL(req.url)
    req.query = new URLSearchParams(query)
    if (router.hasOwnProperty(pathname)) {
      console.log(pathname)
      router[pathname](req,res)
    } else {
      res.end('<h1>~~~~~~~~ 404 NOT FOUND ~~~~~~~~~~</h1>')
    }
  })

