import { setPos, pos } from './index-aaaaaaaaaaa.js'
const cvs = <HTMLCanvasElement>document.getElementById('cvs1')
const clearBtn = <HTMLButtonElement>document.getElementById('clearBtn')
const ctx = <CanvasRenderingContext2D>cvs.getContext('2d')
const penSize = <HTMLInputElement>document.getElementById('stroke')
const penColor = <HTMLInputElement>document.getElementById('color')

const CANVAS_WIDTH = cvs.width = 600
const CANVAS_HEIGHT = cvs.height = 600

// clearBtn?.animate(
//   {
//     easing: ['ease-in', 'ease-out'],
//     color: ['red', 'blue', 'pink'],
//     transform: ['translateY(10px)', 'scale(1.5)', 'translateY(100px)',
//       'translateY(0px)', 'scale(1)'
//     ]
//   }, {
//   duration: 2000, iterations: Infinity
// })
//--------------------------------------------------------------------
const options = {
  lineWidth: 1,
  strokeStyle: '#000'

}

ctx.lineWidth = options.lineWidth
ctx.lineCap = 'round'
ctx.lineJoin = 'round'


cvs.onmousedown = function ({ offsetX, offsetY }) {
  ctx.beginPath()
  ctx.moveTo(offsetX, offsetY)
  cvs.onmousemove = function ({ offsetX, offsetY }) {
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }
  cvs.onmouseup = function () {
    cvs.onmousemove = null
    cvs.onmouseup = null
  }
}

clearBtn.onclick = cl
function cl() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}
penColor.onchange = function <penColor>() {
  ctx.strokeStyle = this.value
}
penSize.onchange = function <penSize>() {
  ctx.lineWidth = this.value
  this.title = this.value
}

function test(pos: number[][], count: number) {
  if (count === 0) return
  ctx.save()
  ctx.font = '30px arial'
  ctx.fillStyle = 'blue'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.beginPath()
  const newPos = setPos(pos)
  newPos.forEach(([x, y], i) => {
    ctx.lineTo(x, y)
    // ctx.closePath()

  })
  // ctx.stroke()
  ctx.closePath()


  ctx.stroke()

  ctx.restore()

  test(newPos, --count)
}
test(pos, 10)