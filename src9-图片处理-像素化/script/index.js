const cvs = document.getElementById('cvs')
class Demo {
  /**
   * @param {HTMLCanvasElement} cvs 
   */
  constructor(cvs) {
    this.ctx = cvs.getContext('2d',{ willReadFrequently: true })
    this.width = cvs.width
    this.height = cvs.height
  }

  drawImage(imgEL) {
    this.ctx.drawImage(imgEL,0,0)

  }

  getPixelate(wide = 5) {
    let posArr = this.createPosArr(wide,wide)
    this.ctx.save()
    for (let i = 0,length = posArr.length; i < length; i += 2) {
      let x = posArr[i],y = posArr[i + 1]
      let [r,g,b,a] = this.getPointdataArr(x,y)
      this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`
      this.ctx.fillRect(x,y,wide,wide)
    }
    this.ctx.restore()
  }

  getPointdataArr(x,y) {
    return this.ctx.getImageData(x,y,1,1).data

  }


  /**
   * 生成 阵列位置 数组
   * @param {*} x_step x 方向间隔
   * @param {*} y_step y 方向间隔
   * @param {boolean} isTypedArray 是否已类型数组 返回结果
   */
  createPosArr(x_step = 1,y_step = 1,isTypedArray = true) {
    const { width,height } = this
    let posArr
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
      posArr = []
      for (let j = 1; j < height; j += y_step) {
        for (let i = 1; i < width; i += x_step) {
          posArr.push([i,j])
        }
      }
    }
    return posArr
  }

  // 画布标尺
  cvsMark() {
    const { ctx } = this
    ctx.save()
    const WIDTH_MARK_LENGTH = cvs.width,
      HEIGHT_MARK_LENGTH = cvs.height
    ctx.fillStyle = '#d9d9d7'

    for (let i = 0; i < WIDTH_MARK_LENGTH; i++) {
      ctx.save()
      if (i && i % 50 === 0) { ctx.fillStyle = '#000'; ctx.fillText(i,i - 8,25) }
      if (i && i % 5 === 0) { ctx.fillRect(i,0,1,i % 100 === 0 ? 10 : 5) }
      ctx.restore()
    }
    for (let i = 0; i < HEIGHT_MARK_LENGTH; i++) {
      ctx.save()
      if (i && i % 50 === 0) { ctx.fillStyle = '#000'; ctx.fillText(i,25,i + 5) }
      if (i && i % 5 === 0) { ctx.fillRect(0,i,i % 100 === 0 ? 10 : 5,1) }
      ctx.restore()
    }
    ctx.restore()
  }

}
let url = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202003%2F09%2F20200309182825_klfkx.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1675315514&t=1437419da8381d4669015fd8ce31db9a'
const demo = window.demo = new Demo(cvs)
let img = new Image()
img.crossOrigin = true
img.src = url
img.onload = function () {
  demo.drawImage(img)

}


