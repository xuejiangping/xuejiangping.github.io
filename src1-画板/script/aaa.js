let scriptText = `
  
`

let sUrl = URL.createObjectURL(new Blob([scriptText]))
const worker = new Worker(sUrl)

const pos = [
  [0,0],[600,0],[600,600],[0,600]
]
function half(a,b) {

  return [
    (b[0] + a[0]) / 2,
    (b[1] + a[1]) / 2
  ]
}
function setPos(pos) {

  return [
    half(pos[0],pos[1]),
    half(pos[1],pos[2]),
    half(pos[3],pos[2]),
    half(pos[0],pos[3]),

  ]
}


export {
  pos,
  setPos
}

