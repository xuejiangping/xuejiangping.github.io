import { setPos, pos } from './index-aaaaaaaaaaa.js'
const cvs = <HTMLCanvasElement>document.getElementById('cvs1')
const clearBtn = <HTMLButtonElement>document.getElementById('clearBtn')
const ctx = <CanvasRenderingContext2D>cvs.getContext('2d')
const penSize = <HTMLInputElement>document.getElementById('stroke')
const penColor = <HTMLInputElement>document.getElementById('color')
const redoBtn = document.getElementById('redo')
const undoBtn = document.getElementById('undo')

const CANVAS_WIDTH = cvs.width = 600
const CANVAS_HEIGHT = cvs.height = 600


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
  cvs.onmouseleave = end
  cvs.onmouseup = end
  function end() {
    cvs.onmousemove = null
    cvs.onmouseup = null
  }
}

clearBtn.onclick = cl

penColor.onchange = function <penColor>() {
  ctx.strokeStyle = this.value
}
penSize.onchange = function <penSize>() {
  ctx.lineWidth = this.value
  this.title = this.value
}
function cl() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}
function test(pos: number[][], count: number) {
  if (count === 0) return
  // ctx.save()
  ctx.beginPath()
  const newPos = setPos(pos)
  newPos.forEach(([x, y], i) => {
    ctx.lineTo(x, y)
    // ctx.closePath()

  })
  // ctx.stroke()
  ctx.closePath()


  ctx.stroke()


  test(newPos, --count)
}
// test(pos, 10)

function drawCircle(n = 5) {
  ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
  for (let i = 0; i < n; i++) {
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - i * 15, 200 - i * 15, 0, Math.PI * 2)

    // ctx.stroke()
    i % 2 ? ctx.fillStyle = 'yellow' : ctx.fillStyle = 'pink'
    ctx.fill()

  }

  for (let i = 0; i < n; i++) {
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100 + i * 15, 100 - i * 15, 0, Math.PI * 2)
    i % 2 ? ctx.fillStyle = 'pink' : ctx.fillStyle = 'yellow'
    ctx.fill()

  }
}
drawCircle(6)


let img = new Image()
img.src = cvs.toDataURL()
document.body.appendChild(img)
img.animate({
  transform: ['rotate(0deg)', 'rotate(360deg)']
}, { duration: 2000, iterations: Infinity })
