const { WriteStream,createWriteStream } = require("fs")
const cheerio = require('cheerio');
const http = require('http');
const { parse: parseURL } = require("url");
const path = require("path");
const { TextDecoder } = require("util");
const router = {}

router['/baike'] = function (req,res) {
  const keyword = req.query.get('keyword')
  console.log('keyword',keyword)
  search(keyword).then(val => res.end(val))
}
/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
router['/upload'] = function (req,res) {
  let a = []

  let ws = createWriteStream(path.join(__dirname,'aaaaa.jpg'))
  // req.pipe(ws)
  req.on('data',ck => {
    // console.log('ck',ck)
    // a.push(ck)
    console.log('ck.length',ck.length)
    ws.write(ck)

  })
  req.on('end',() => {
    res.end('文件up')

  })


  // req.on('end',(e) => {
  //   // let fileName = new URLSearchParams(a).get('file')

  //   console.log('a',a)
  //   let b = new Blob(a)

  //   console.log('Blob(a)',b)
  // })
}



http.createServer((req,res) => {
  res.setHeader('Content-Type','text/html;charset=UTF-8')
  res.setHeader('access-control-allow-origin','*')
  res.setHeader('Access-Control-Allow-Headers','*')



}).listen(9000,() => console.log('服务器启动成功: http://localhost:9000'))
  .on('request',(req,res) => {

    const { pathname,query } = parseURL(req.url)
    req.query = new URLSearchParams(query)
    if (router.hasOwnProperty(pathname)) {
      router[pathname](req,res)
    } else {
      res.end('<h1>~~~~~~~~ 404 NOT FOUND ~~~~~~~~~~</h1>')
    }
  })

// search('狄仁杰')
async function search(keyword) {
  return new Promise(async (resolve) => {
    let url = 'https://baike.baidu.com/item/' + keyword
    // url = encodeURI(url)
    try {
      const res = await fetch(url)
      const htmlStr = await res.text()
      const $ = cheerio.load(htmlStr)
      const val = $('.content .main-content').text()
      resolve(val)
    } catch (error) {
      console.log(error)
    }
  })


}