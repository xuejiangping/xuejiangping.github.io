const ctx = document.getElementById('cvs').getContext('2d',{ willReadFrequently: true })
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function main(ctx) {
  const scale = 50
  const setPoint = (args,originPos) => { ctx.fillRect(...args,4,4); showPoint(args,originPos) }
  const showPoint = (args,originPos) => ctx.fillText(`   (${originPos})`,...args)
  const setLine = (args,originPos) => { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(...args); ctx.stroke(); setPoint(args,originPos) }
  const invok = (victor,fn) => fn(victor.map(v => v * scale),victor)
  const multi = (vA,vB) => vA.map((v,i) => v * vB[i])
  const sum = (vA,vB) => vA.map((v,i) => v + vB[i])
  let victorA = [2,1],victorB = [2,3]
  invok(victorA,setLine)
  invok(victorB,setLine)
  invok(multi(victorA,victorB),setLine)
  invok(sum(victorA,victorB),setLine)

}
// main(ctx)

class Maze {
  /**
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(ctx) {
    this.ctx = ctx
    this.img = new Image
    this.imgDataOfMap = null
    this.width = ctx.canvas.width
    this.height = ctx.canvas.height
    this.ctx.fillStyle = 'red'
    this.x = 58
    this.y = 100
    this.r = 6
    this.Vx = 1
    this.Vy = 0


  }
  loadMap(url) {
    return new Promise(res => {
      this.img.src = url
      this.img.onload = () => {
        this.ctx.drawImage(this.img,0,0,this.width,this.height)
        this.imgDataOfMap = this.ctx.getImageData(0,0,this.width,this.height)
        res()
      }
    })
  }
  drawBall(x,y,r) {
    this.ctx.clearRect(0,0,this.width,this.height)
    this.ctx.putImageData(this.imgDataOfMap,0,0)
    this.ctx.beginPath()
    this.ctx.arc(x + r,y + r,r,0,Math.PI * 2)
    this.ctx.fill()
  }
  boundaryDetection(x,y) {
    const { Vx,Vy,r } = this
    const _rgbTest = (r,g,b,limit = 150) => r + g + b < limit
    if (Vx > 0) {
      const [r1,g1,b1] = this.ctx.getImageData(x + r,y,1,1).data
      if (_rgbTest(r1,g1,b1)) {
        console.log('碰到右边')
        return 'right'
      }
    } else if (Vx < 0) {
      const [r1,g1,b1] = this.ctx.getImageData(x - r,y,1,1).data
      if (_rgbTest(r1,g1,b1)) {
        console.log('碰到左边')
        return 'left'
      }
    }
    if (Vy > 0) {
      const [r2,g2,b2] = this.ctx.getImageData(x,y + r,1,1).data
      if (_rgbTest(r2,g2,b2)) {
        console.log('碰到下边')
        return 'bottom'
      }
    } else if (Vx < 0) {
      const [r2,g2,b2] = this.ctx.getImageData(x,y - r,1,1).data
      if (_rgbTest(r2,g2,b2)) {
        console.log('碰到上边')
        return 'top'
      }
    }
    return false
  }
  render() {
    // window.requestAnimationFrame(this.render.bind(this))
    this.move()
  }
  move() {
    const { x,y,Vx,Vy,r } = this
    const res = this.boundaryDetection(Vx + x,Vy + y)
    console.log(res)
    if (res) {
      switch (res) {
        case 'up':
          this.Vy = 0; this.Vx = 1
          break;
        case 'bottom':
          this.Vy = 0; this.Vx = -1
          break;
        case 'left':
          this.Vx = 0; this.Vy = -1
          break;
        case 'right':
          this.Vx = 0; this.Vy = 1
          break;
      }
    } else {
      this.drawBall(this.x += Vx,this.y += Vy,r)
    }
  }

}
let maze = window.maze = new Maze(ctx)
maze.loadMap('./assets/southeast.jpg').then(() => {
  maze.render()
})



