const cheerio = require('cheerio');
const { IncomingMessage,ServerResponse } = require('http');
const { TextDecoder } = require("util");
const fs = require('fs');
const { Readable } = require('stream');
const soundHound = require('../../../../网易云/NeteaseCloudMusic-Audio-Recognize/index.js')
const decoder = new TextDecoder()



function shiqu(req,res) {
  let ckArr = []
  req.on('data',ck => ckArr.push(ck))
  req.on('end',() => {
    let buffer = Buffer.concat(ckArr)
    console.log('ckArr',ckArr)
    console.log('buffer',buffer)

    // soundHound(buffer).then(val => {
    //   let data = val.data.data?.result[0]
    //   res.end(data)
    // })
    // res.end('231')

  })
  res.end('1')
}
function baike(req,res) {
  const keyword = req.query.get('keyword')
  console.log('keyword',keyword)
  search(keyword).then(val => res.end(val))
}
function proxy(req,res) {
  const url = req.query.get('url')
  fetch(url).then(r => r.text()).then(html => res.end(html))
}
/**
 * vscode 保存代码钩子
 * @param {IncomingMessage} req 
 * @param {*} res 
 */
function onSaveHook(req,res,cb) {
  let val = ''
  req.on('data',ck => {
    val += decoder.decode(ck,{ stream: true })
  })
  req.on('end',() => {
    cb(val)
    res.end()
  })
}


// search('狄仁杰')
function search(keyword) {
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

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
function uploadFile(req,res) {
  console.log('req.headers',req.headers)
  let v = []
  req.on('data',(c) => {
    v.push(c)
  })
  req.on('end',() => {
    let a = Buffer.concat(v)
    console.log('a',a)
  })
  res.end('11')
}
const ws = fs.createWriteStream('./aaa.txt',{ flags: 'a' })


function danmu(req,res) {
  res.end()
  const formatData = data => (
    `
      昵称：${data.uname}
      弹幕：${data.danmaku}
    `
  )
  const data = JSON.parse(req.query.get('data'))
  console.log('data',data[0])
  data.forEach(v => ws.write(formatData(v)))
}


module.exports = {
  baike,proxy,onSaveHook,uploadFile,danmu,shiqu
}