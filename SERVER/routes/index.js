const router = require('../router/index.js')
const fs = require('fs/promises')
const path = require('path')
const cheerio = require('cheerio');
const { TextDecoder } = require("util");
// const soundHound = require('../../../../网易云/NeteaseCloudMusic-Audio-Recognize/index.js')
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

function danmu(req,res) {
  res.statusCode = 200
  res.end('ok')

  const formatData = data => (
    `
      昵称：${data.uname}
      弹幕：${data.danmaku}
    `
  )
  try {
    const data = JSON.parse(req.query.get('data'))
    console.log('data',data)
  } catch (error) {
    console.error(error)
  }

  // data.forEach(v => ws.write(formatData(v)))
}


router.get('/baike',baike)
router.get('/proxy',(req,res) => {
  const url = req.searchParams.get('url')
  req.headers['content-type']
  if (!url) throw new Error('url is invalid')



  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    'Referer': 'https://www.google.com/',
    'DNT': '1'
  }
  fetch(url).then(r => r.text()).then(html => res.writeHead(200,headers).end(html))
})
router.get('/onSaveHook',onSaveHook)
router.get('/uploadFile',uploadFile)
router.get('/danmu',danmu)

router.get('/shiqu',shiqu)
router.get('/test',(req,res) => {
  res.end('999')
  console.log(req.method)
  let str = ''
  req.on('data',ck => str += ck)
  req.on('end',() => console.log(str))
})