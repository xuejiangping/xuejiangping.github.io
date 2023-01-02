
const pos = [
  [0,0],[600,0],[600,600],[0,600]
]
/**
 * 
 * @param {array} pos 
 * @returns 
 */
function setPos(pos) {
  const half = (a,b) => [(b[0] + a[0]) / 2,(b[1] + a[1]) / 2]
  return pos.map((v,i,array) => i == array.length - 1 ? half(v,array[0]) : half(v,array[i + 1]))
}



export {
  pos,
  setPos
}

