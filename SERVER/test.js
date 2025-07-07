const { spawn,ChildProcess } = require("child_process")


class ChildProcessApp {

  /**@type { ChildProcess } */
  app = null

  constructor({ app = 'pwsh',args = [],options = {} } = {}) {
    this.app = spawn(app,args,Object.assign({ stdio: ['pipe','pipe','pipe'] },options))


    this.app.stdout.on('end',() => {
      console.log('end')
    })
    this.app.stdout.on('data',(ck) => {
      console.log(ck + '')
      console.log('ck',ck.length)
    })
    process.on('exit',(code) => {
      this.app.kill()
    })

  }
  execCMD(cmdStr) {
    if (!this.app || !cmdStr) return
    this.app.stdin.write(`${cmdStr}\n`)
  }
}

const cp = new ChildProcessApp()


setTimeout(() => {
  cp.execCMD(`get-date`)
},3000);

