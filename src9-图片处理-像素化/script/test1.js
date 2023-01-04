// const { createWriteStream } = require('fs')
const { readFile,readdir,stat,writeFile } = require('fs/promises')
const path = require('path')
let reg = /(?<=<title>).*?(?=<\/title>)/
let text = '浮生浪迹笑明月'
/**
 * 读取目录，中所的文件
 * @param {string} myPath 
 * @param {(fileName:string)=>boolean} fn1 找到需处理的文件 
 * @param {(data:T)=>写入的数据} fn2  处理数据

 */
async function main(myPath,fn1,fn2) {
  let dir = await readdir(myPath)
  if (dir.length < 1) return
  dir.forEach(async (v) => {
    if (v === 'node_modules') return
    let currentPath = path.join(myPath,v)
    let stats = await stat(currentPath)
    if (stats.isFile() && fn1(v)) {
      fn2(currentPath)
      // let data = await readFile(currentPath,{ encoding: 'utf-8' })
      // await writeFile(currentPath,fn2(data))
      // console.log('修改完成 =>',currentPath)
    } else if (stats.isDirectory()) {
      main(currentPath,fn1,fn2)
    }
  })

}

// let ws = createWriteStream('./aaaaaaaa.txt')
// main('C://Users/xue647464/Desktop/',
//   console.log
//   // data => data.replace(/.*/,'嘈嘈切切错杂弹')
// )
/**
 * @class 将页面中视频 像素化
 */
class Demo2 {
  /**
   * 
   * @param {HTMLCanvasElement} targetCvs 
   */
  constructor(targetEl) {
    this.cvs = document.createElement('canvas')
    this.ctx = this.cvs.getContext('2d',{ willReadFrequently: true })
    this.targetEl = targetEl
    this._pixWide = 5
  }
  init(w = 300,h = 280,dx,dy) {
    this.cvs.width = this.width = w
    this.cvs.height = this.height = h
    this.cvs.style.position = 'absolute'
    const { x,y } = this.targetEl.getBoundingClientRect()
    this.cvs.style.left = x + dx + 'px'
    this.cvs.style.top = y + dy + 'px'
    this.cvs.style.border = '1px solid blue'
    document.body.appendChild(this.cvs)
    this.updatePosArr()
    return this
  }
  get pixWide() {
    return this._pixWide
  }
  set pixWide(v) { this._pixWide = v; this.updatePosArr() }
  updatePosArr() {
    this.posArr = this.createPosArr(this._pixWide,this._pixWide)
  }
  getPointdataArr(x,y) {
    return this.ctx.getImageData(x,y,1,1).data
  }
  getPixelate(wide = 5) {
    let { posArr } = this
    for (let i = 0,length = posArr.length; i < length; i += 2) {
      let x = posArr[i],y = posArr[i + 1]
      this.ctx.fillStyle = `rgba(${this.getPointdataArr(x,y)})`
      this.ctx.fillRect(x,y,wide,wide)
    }
  }
  createPosArr(x_step = 1,y_step = 1,isTypedArray = true) {
    console.count('createPosArr')
    const { width,height } = this
    let posArr = []
    if (isTypedArray) {
      const posArrLength = 2 * Math.floor(width / x_step) * Math.floor(height / y_step)
      posArr = new Uint16Array(posArrLength)
      for (let j = 1,k = 0; j < height; j += y_step) {
        for (let i = 1; i < width; i += x_step) {
          posArr[k++] = i
          posArr[k++] = j
        }
      }
    } else {
      for (let j = 1; j < height; j += y_step) {
        for (let i = 1; i < width; i += x_step) {
          posArr.push([i,j])
        }
      }
    }
    return posArr
  }

  render() {
    requestAnimationFrame(this.render.bind(this))
    const { width,height,ctx,targetEl,_pixWide } = this
    ctx.clearRect(0,0,width,height)
    ctx.drawImage(targetEl,0,0,width,height)
    this.getPixelate(_pixWide)
  }

}
// demo = new Demo2(v).init(300,200,200,100 + v.clientHeight)

async function a(myPath) {
  const dirArr = await readdir(myPath)
  const reg = /^src\d/
  const reg2 = /(?<=<body>)(.|\n|\r)*?(?=<\/body>)/
  let res = dirArr.reduce((t,v) => reg.test(v) ? `${t}<h1><a href="./${v}">${v}</a></h1>\n` : t,'\n')
  let data = await readFile(myPath + 'index.html','utf-8')
  let newData = data.replace(reg2,res)
  await writeFile(myPath + 'index.html',newData)
  // console.log('写入完成')
}
a('./')




// debugger