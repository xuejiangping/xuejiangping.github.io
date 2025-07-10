/**
 * @typedef {'post'|'get'}  Method
 * @typedef {import('../utils/index.js').TansformReq } TansformReq
 * @typedef {IncomingMessage&{pathname:string,searchParams:URLSearchParams}&TansformReq}Req
 * @typedef {ServerResponse&TansformReq }Res
 * @typedef {(req:Req,res:Res)=>void } Listener
 * @typedef {Map<string,Map<Method,Set<Listener>>>} Rules
 * @typedef {import('http').Server} Server
 */
const { ServerResponse,IncomingMessage } = require('http')



class Router {

  /**@type {Server} */
  _app = null
  _basePath = ''
  /**@type {Rules} */
  _rules = new Map()
  staticFileDir = ''
  STATIC_PATH_PEFIX = '/static'

  /**
   * 
   * @param {{app:Server,basePath:string}} options 
   */
  init({ app,basePath,staticFileDir }) {
    if (!app) throw new Error('app is invalid')
    this._app = app
    this._basePath = basePath
    this._request_handler = this._http_handler
    this.staticFileDir = staticFileDir


    app.on('request',async (/**@type  {Req} */req,/**@type {ServerResponse}*/res) => {
      const { method,pathname } = req
      // console.log('pathname',pathname)
      const listeners =
        (this.staticFileDir && (pathname == this.STATIC_PATH_PEFIX || pathname.startsWith(this.STATIC_PATH_PEFIX + '/')))
          ? this._rules.get(this.STATIC_PATH_PEFIX)?.get(method)
          : this._rules.get(pathname)?.get(method)
      // debugger
      if (listeners?.size) {
        try {
          this.runListener(listeners,req,res)
        } catch (error) {
          console.error('路由逻辑执行错误：',error)
          res.writeHead(500,'error').end(`<h1>500  server error</h1><h2>${error}</h2>`)
        }
      } else {
        res.statusCode = 404
        res.setHeader('Content-Type','text/html;charset=utf-8')
        res.end('<h1>404  not found</h1>')
      }
    })
  }

  async runListener(listeners,req,res) {
    const taskList = Array.from(listeners).map(listener => () => listener(req,res))
    for (let task of taskList) {
      await task()
    }

  }

  /**
 * @param {string} path
 * @param {Method}  method
 * @param {Listener} listener 
 */
  addRule(path,method,listener) {
    if (this._basePath) path = this._basePath + path
    method = method.toUpperCase()
    if (!this._rules.has(path)) this._rules.set(path,new Map())
    if (!this._rules.get(path).has(method)) this._rules.get(path).set(method,new Set())
    this._rules.get(path).get(method).add(listener)

  }
  /**
   * 
   * @param {Method} method 
   * @param {string} path 
   * @returns 
   */
  map(method,path) {
    return (t,p) => {
      if (typeof t[p] === 'function') this.addRule(path,method,t[p].bind(t))
      else throw new Error(`${p} is not a function`)
    }
  }
  /**
   * @param {string} path 
   */
  get(path) {
    return this.map('get',path)

  }
  /**
   * @param {string} path 
   */
  post(path) {
    return this.map('post',path)
  }



}





module.exports = Router