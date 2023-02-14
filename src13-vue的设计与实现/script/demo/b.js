// wss websocket 服务器

const fs = require('fs')
const https = require('https')
const WS = require('ws').Server
const options = {
  key: fs.readFileSync('./SERVER/cert/key.pem'),
  cert: fs.readFileSync('./SERVER/cert/cert.pem')
}
const app = https.createServer(options,(req,res) => {
  res.end('wss ok')
}).listen(1234,'127.0.0.1',() => console.log('https'))
const wss = new WS({ server: app })
wss.on('connection',cne => {
  console.log('新连接！',wss.clients)
  cne.onerror = err => console.log(err)
  cne.onmessage = ({ data }) => {
    console.log('msg',data)
    cne.send(`alert('reply')`)
  }
})






function* EnumerateObjectProperties(obj) {
  const visited = new Set();
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key === "symbol") continue;
    const desc = Reflect.getOwnPropertyDescriptor(obj,key);
    if (desc) {
      visited.add(key);
      if (desc.enumerable) yield key;
    }
  }
  const proto = Reflect.getPrototypeOf(obj);
  if (proto === null) return
  for (const protoKey of EnumerateObjectProperties(proto)) {
    if (!visited.has(protoKey)) yield protoKey;
  }
}
// let res = EnumerateObjectProperties({
//   name: 'zs',age: 123,
//   sing() { console.log(1) },


// })
//  向页面 慢慢添加文本
function fn() {
  fetch(location.href + '/script/index.js').then(res => res.text()).then(str => {

    let i = 0,{ length } = str,step = 3
    let t = setInterval(() => {
      if (i >= length) clearInterval(t)
      const v = str.slice(i,i += step)
      let textNode = document.createTextNode(v)
      document.body.append(textNode)
      document.documentElement.scrollIntoView(false)
    },100)

  })
}
// fn()

