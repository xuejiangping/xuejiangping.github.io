const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
console.log('ctx',ctx)



function randomNum() {
  return [
    Math.random() * cvs.clientWidth,
    Math.random() * cvs.clientHeight
  ]
}
function setRandomPints(n) {
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push(randomNum())
  }
  return arr
}




// let a = setRandomPints(5)
// a.forEach(([x,y],i) => {
//   ctx.lineTo(x,y)
//   ctx.fillRect(x,y,5,5)
//   ctx.fillText(i + 1,x,y)
// })
// ctx.closePath()
// ctx.stroke()