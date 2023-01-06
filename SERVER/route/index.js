const cheerio = require('cheerio');
const { TextDecoder } = require("util");

const decoder = new TextDecoder()

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

module.exports = {
  baike,proxy,onSaveHook
}