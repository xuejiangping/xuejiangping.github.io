/**@typedef {typeof transformReq} TansformReq */
const transformReq = {
  _readed: false,
  _arraybuffer: null,
  /**
   * @param {http.IncomingMessage} req
   * @returns {Promise<Buffer>}
   */
  arraybuffer() {
    if (this._readed) return Promise.resolve(this._arraybuffer)

    return new Promise((res,rej) => {
      const bufferArr = []
      this.on('data',(chunk) => {
        bufferArr.push(chunk)
      })
      this.on('end',() => {
        this._arraybuffer = Buffer.concat(bufferArr)
        res(this._arraybuffer)
        this._readed = true

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