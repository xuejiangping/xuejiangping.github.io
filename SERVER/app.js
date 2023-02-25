const { WriteStream,createWriteStream,readFileSync } = require("fs")
const Server = {
  http: require('http'),
  https: require('https')
}

const WS = require('ws').Server
const { parse: parseURL } = require("url");
const { proxy,onSaveHook,baike,uploadFile } = require("./route/index");
const path = require("path");
const host = 'localhost'
const port = 9000
const protocol = 'http'
const ws_protocol = protocol === 'http' ? 'ws' : 'wss'
const options = {
  cert: readFileSync(path.join(__dirname,'./cert/cert.pem')),
  key: readFileSync(path.join(__dirname,'./cert/key.pem'))
}


// 广播
function broadcast(msg) {
  ws.clients.forEach(cne => cne.sendText(msg))
}




const router = {
  '/baike': baike,
  '/proxy': proxy,
  '/onSaveHook': (req,res) => onSaveHook(req,res,broadcast),
  '/uploadFile': uploadFile
}





// 创建服务器
const app = Server[protocol].createServer(options,(req,res) => {
  res.setHeader('Content-Type','text/html;charset=UTF-8')
  res.setHeader('access-control-allow-origin','*')
  res.setHeader('Access-Control-Allow-Headers','*')

}).listen(port,host,() => console.log(`服务器启动成功: ${protocol}://${host}:${port}`))
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

// web-socket 服务
const ws = new WS({ server: app }).on('listening',() => {
  console.log('web-socket 服务启动：',`${ws_protocol}://${host}:${port}`)
}).on('connection',(cne) => {
  cne.onerror = err => console.log('发生错误: ',err.message)
  console.log('当前连接数量：',ws.clients.size)
})
