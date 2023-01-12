const ctx = document.getElementById('cvs').getContext('2d')
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


