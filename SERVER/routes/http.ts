// const { http_router: router } = require('../router/index.js')
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createReadStream, Dirent, existsSync, statSync } from 'fs';

import { readdir } from 'fs/promises';
import { Readable } from 'stream';
import { http_router as router } from '../router/index.js';
import type { Req, Res } from '../router/Router.js';

import path from 'path';
// const cheerio = require('cheerio');

// const { TextDecoder } = require("util");
// const soundHound = require('../../../../网易云/NeteaseCloudMusic-Audio-Recognize/index.js')
const decoder = new TextDecoder()

// function shiqu(req, res) {
//   let ckArr = []
//   req.on('data', ck => ckArr.push(ck))
//   req.on('end', () => {
//     let buffer = Buffer.concat(ckArr)
//     console.log('ckArr', ckArr)
//     console.log('buffer', buffer)

//     // soundHound(buffer).then(val => {
//     //   let data = val.data.data?.result[0]
//     //   res.end(data)
//     // })
//     // res.end('231')

//   })
//   res.end('1')
// }
// function baike(req, res) {
//   const keyword = req.query.get('keyword')
//   console.log('keyword', keyword)
//   search(keyword).then(val => res.end(val))
// }

// function onSaveHook(req, res, cb) {
//   let val = ''
//   req.on('data', ck => {
//     val += decoder.decode(ck, { stream: true })
//   })
//   req.on('end', () => {
//     cb(val)
//     res.end()
//   })
// }


// // search('狄仁杰')
// function search(keyword) {
//   return new Promise(async (resolve) => {
//     let url = 'https://baike.baidu.com/item/' + keyword
//     // url = encodeURI(url)
//     try {
//       const res = await fetch(url)
//       const htmlStr = await res.text()
//       const $ = cheerio.load(htmlStr)
//       const val = $('.content .main-content').text()
//       resolve(val)
//     } catch (error) {
//       console.log(error)
//     }
//   })


// }

// function uploadFile(req, res) {
//   console.log('req.headers', req.headers)
//   let v = []
//   req.on('data', (c) => {
//     v.push(c)
//   })
//   req.on('end', () => {
//     let a = Buffer.concat(v)
//     console.log('a', a)
//   })
//   res.end('11')
// }

// function danmu(req, res) {
//   res.statusCode = 200
//   res.end('ok')

//   const formatData = data => (
//     `
//       昵称：${data.uname}
//       弹幕：${data.danmaku}
//     `
//   )
//   try {
//     const data = JSON.parse(req.query.get('data'))
//     console.log('data', data)
//   } catch (error) {
//     console.error(error)
//   }

//   // data.forEach(v => ws.write(formatData(v)))
// }


// router.get('/baike', baike)
// router.get('/proxy', (req, res) => {
//   const url = req.searchParams.get('url')
//   req.headers['content-type']
//   if (!url) throw new Error('url is invalid')



//   const headers = {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
//     'Referer': 'https://www.google.com/',
//     'DNT': '1'
//   }
//   fetch(url).then(r => r.text()).then(html => res.writeHead(200, headers).end(html))
// })
// router.get('/onSaveHook', onSaveHook)
// router.get('/uploadFile', uploadFile)
// router.get('/danmu', danmu)

// router.get('/shiqu', shiqu)
// router.get('/test', (req, res) => {
//   console.log('get', req.searchParams)
//   res.text().then(str => console.log('get', str))
//   res.end('999')
// })
// router.post('/test', (req, res) => {
//   console.log('post', req.searchParams)
//   req.text().then(str => console.log('post', str))
//   res.end('post 999')


// })



class ChildProcessApp {


  app: ChildProcessWithoutNullStreams | null = null

  constructor({ app = 'pwsh', args = [], options = {} }: { app: string, args: string[], options: object }) {
    this.app = spawn(app, args, { stdio: ['pipe', 'pipe', 'pipe'], ...options })
  }
  execCMD(cmdStr: string) {
    return new Promise<Readable>((res, rej) => {
      if (!this.app || !cmdStr) return rej('no app or or cmdStr')
      const readableStream = this.createReadableStream()
      this.app.stdin.write(`${cmdStr}\n`, err => {
        if (err) {
          rej(err)
          readableStream.destroy()
        } else {
          res(readableStream)
        }
      })
    })
  }

  createReadableStream() {
    const _this = this
    return new Readable({
      read() {
        _this.app!.stdout.once('data', (data: Buffer) => {
          if (data.toString().startsWith('PS ')) {
            this.push(null)
          }
          else this.push(data)
        })

        _this.app!.stderr.once('data', (data: Buffer) => {
          this.push(data)
        })
      }
    })
  }

}







class HttpRequestController {

  static cp = new ChildProcessApp({
    app: 'pwsh',
    args: [],
    options: {
      // cwd: '%desktop%'
    }
  })



  @router.get('/execCMD')
  @router.post('/execCMD')
  async execCMDP(req: Req, res: Res) {
    try {
      let cmdStr
      if (req.method == 'GET') cmdStr = req.searchParams.get('cmd')
      else cmdStr = await req.text()
      cmdStr = cmdStr?.trim()
      if (!cmdStr) throw new Error('cmdStr is empty')
      console.log('cmdStr', cmdStr)
      cmdStr += '| Out-String'
      const readableStream = await HttpRequestController.cp.execCMD(cmdStr)
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=gbk' })
      readableStream.pipe(res)
    } catch (error) {
      if (error instanceof Error) res.end(error.message)
      else res.end(error)
    }
  }
  @router.map('post', '/test')
  async test(req: Req, res: Res) {
    const str = await req.text();
    console.log('post', str);
    // res.end('post 999')
  }


  @router.map('post', '/test')
  test2(req: Req, res: Res) {
    req.text().then(str => console.log('post', str))
    res.end('post 9992')
  }

}

class StaticFileController {

  static handleFile(res: Res, filePath: string) {
    // res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'content-disposition': `attachment; filename=${path.basename(filePath)}` })
    const fileStream = createReadStream(filePath).pipe(res)
    // 错误处理（避免进程崩溃）
    fileStream.on('error', (err) => {
      console.error('文件读取错误:', err);
      res.statusCode = 500;
      res.end('文件读取错误,服务器错误');
    });
  }

  static generateDirHtml(list: Dirent<string>[], pathname: string) {
    // path.relative(router.staticFileDir)
    const resolveDir = (name: string) => path.join(pathname, name)
    return `<ul>${list.map(item =>
      ` <li>
      ${item.isFile() ? 'file' : item.isDirectory() ? 'dir' : 'unknow'}: <a target="_self" 
      href="${resolveDir(item.name)}">${item.name}</a>
      </li>`
    ).join('')
      }</ul>`
  }
  static async handleDir(res: Res, filePath: string, pathname: string) {
    const list = await readdir(filePath, { 'withFileTypes': true })
    const html = this.generateDirHtml(list, pathname)
    res.end(html)
  }

  @router.map('get', `${router.STATIC_PATH_PEFIX}/*`)
  static staticFile(req: Req, res: Res) {
    const relativePath = path.relative(router.STATIC_PATH_PEFIX, req.pathname)
    const filePath = path.join(router.staticFileDir, relativePath)
    console.log('filePath', filePath)
    // console.log('relativePath', relativePath)

    if (existsSync(filePath)) {
      const state = statSync(filePath)
      if (state.isDirectory()) this.handleDir(res, filePath, req.pathname)
      else this.handleFile(res, filePath)

    } else {
      res.end(`${filePath} 不存在`)

    }

  }
}


