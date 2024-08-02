


/**@type {HTMLCanvasElement} */
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')

const w = 500,h = 500

cvs.width = w
cvs.height = h
cvs.style.border = "1px solid"

/** 将坐标移到中心 */
ctx.translate(w / 2,h)
ctx.scale(1,-1)
ctx.lineCap = 'round'
ctx.lineJoin = 'bevel'

const ang_to_rad = (angle) => angle * Math.PI / 180
const rad_to_ang = (rad) => rad * 180 / Math.PI
const generateRandom = (min,max) => Math.floor(Math.random() * (max - min + 1)) + min
let i = 0
function drawTree(pos = [0,0],angle = 90,len = 100,width = 10) {

  if (width < generateRandom(1,2) || len < 8) {

    if (generateRandom(1,10) > 5) {
      ctx.arc(...pos,generateRandom(3,5),0,2 * Math.PI)
      ctx.fillStyle = 'red'
      ctx.fill()
    }



    return
  }
  i++
  const [startX,startY] = pos


  ctx.beginPath()
  ctx.lineWidth = width
  ctx.moveTo(...pos)
  const endX = Math.cos(angle) * len + startX
  const endY = Math.sin(angle) * len + startY
  ctx.lineTo(endX,endY)
  ctx.stroke()
  ctx.closePath()


  const n = generateRandom(1,3)
  for (let i = 0; i < n; i++) {


    drawTree([endX,endY],ang_to_rad(generateRandom(10,170)),len * 0.8,width * 0.8)

  }

}

// drawTree([0,0],ang_to_rad(generateRandom(80,100)),100,10)
drawTree([0,0],ang_to_rad(90),100,10)

console.log('i的数量：',i)

/**
 * @param {HTMLElement} el
 */

function mouseDirectionDetect(el,cb) {
  const { width,height } = el.getBoundingClientRect()
  const center = [width / 2,height / 2]


  el.addEventListener('mouseenter',e => {
    const { offsetX,offsetY } = e
    const angle = rad_to_ang(Math.atan2(center[1] - offsetY,center[0] - offsetX))
    // console.log('angle',angle)
    // debugger

    switch (true) {

      case -45 <= angle && angle <= 45:
        cb('左')
        break

      case 45 < angle && angle <= 135:
        cb('上')
        break
      case 135 <= angle || angle <= -135:
        cb('右')
        break
      case -135 <= angle && angle <= -45:
        cb('下')
        break
      default:
        cb('未知')
    }

    // console.log(rad_to_ang(angle))
  })
}
const h1 = document.querySelector('h1')

mouseDirectionDetect(cvs,direction => h1.innerText = direction)



/**
 * 
 * @param {HTMLElement} root 
 * @param { string|RegExp} word
 */
function replaceNode(root,word,replaceVal = '',template = document.createElement('span')) {
  root.querySelectorAll('&>:not(head,script,meta').forEach(el => replaceNode(el,word,replaceVal,template))

  if (root.hasChildNodes) {
    const nodes = Array.from(root.childNodes)
    nodes.forEach(node => {
      if (node.nodeType === node.TEXT_NODE) {
        const reg = typeof word === 'string' ? new RegExp(word,'ig') : word
        if (reg.test(node.nodeValue)) {
          const str = node.nodeValue.replace(reg,replaceVal || `<span style="background-color:red" >${word}</span>`)
          template.innerHTML = str
          node.replaceWith(...template.childNodes)
        }
      }
    })
  }

}