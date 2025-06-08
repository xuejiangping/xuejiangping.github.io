/**
 * @typedef {'post'|'get'}  Method
 * @typedef {IncomingMessage&{pathname:string,searchParams:URLSearchParams}&import('../utils/index.js').TansformReq  }Req
 * @typedef {(req:Req,res:ServerResponse&{req:Req})=>void } Listener
 * @typedef {Map<string,Map<Method,Set<Listener>>>} Rules
 * @typedef {import('http').Server} Server
 */
const { ServerResponse,IncomingMessage } = require('http')



class Router {


  /**
   * 
   * @param {Server} app 
   */
  init(app) {
    this._app = app
    this._app.on('request',(/**@type  {Req} */req,/**@type {ServerResponse}*/res) => {

      const { method,pathname,searchParams } = req

      const listeners = this._rules.get(pathname)?.get(method)
      if (listeners?.size) {
        try {
          listeners.forEach(listener => listener(req,res))
        } catch (error) {
          console.error('路由逻辑执行错误：',error)
          res.writeHead(500,'error').end(`<h1>500  server error</h1><h2>${error}</h2>`)
        }
      } else {
        res.statusCode = 404
        res.end('<h1>404  not found</h1>')
      }

    })
  }


  /**@type {Rules} */
  _rules = new Map()

  /**
 * @param {string} path
 * @param {Method}  method
 * @param {Listener} listener 
 */
  addRule(path,method,listener) {
    method = method.toUpperCase()
    if (!this._rules.has(path)) this._rules.set(path,new Map())
    if (!this._rules.get(path).has(method)) this._rules.get(path).set(method,new Set())
    this._rules.get(path).get(method).add(listener)

  }
  /**
   * 
   * @param {string} path 
   * @param {Listener} listener 
   */
  get(path,listener) {
    this.addRule(path,'get',listener)
  }
  /**
   * 
   * @param {string} path 
   * @param {Listener} listener 
   */
  post(path,listener) {
    this.addRule(path,'post',listener)
  }

}

module.exports = Router