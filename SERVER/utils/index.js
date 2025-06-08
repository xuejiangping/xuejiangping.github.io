/**@typedef {typeof transformReq} TansformReq */
const transformReq = {
  /**
   * @param {http.IncomingMessage} req
   * @returns {Promise<Buffer>}
   */
  arraybuffer(req) {
    return new Promise((res,rej) => {
      const bufferArr = []
      this.on('data',(chunk) => {
        bufferArr.push(chunk)
      })
      this.on('end',() => {
        res(Buffer.concat(bufferArr))
      })
      this.on('error',(err) => rej(err))
    })
  },
  text() {

    return this.arraybuffer().then(buf => buf.toString('utf8'))
  },
  json() {
    return this.text().then(text => JSON.parse(text))
  }
}

module.exports = { transformReq }