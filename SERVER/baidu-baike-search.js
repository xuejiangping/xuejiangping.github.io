// const { WriteStream,createWriteStream } = require("fs")
const cheerio = require('cheerio');
const http = require('http');
const { parse: parseURL } = require("url");




http.createServer((req,res) => {
  res.setHeader('Content-Type','text/html;charset=UTF-8')
}).listen(9000,'localhost',() => console.log('服务器启动成功: http://localhost:9000'))
  .on('request',(req,res) => {
    const { pathname,query } = parseURL(req.url)
    if (pathname !== '/baike') return res.end('无此路由地址')
    const keyword = new URLSearchParams(query).get('keyword')
    console.log('keyword',keyword)
    search(keyword).then(val => res.end(val))
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