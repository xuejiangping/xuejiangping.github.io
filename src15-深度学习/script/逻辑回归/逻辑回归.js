const nj = require('../lib/numjs.min.js')

/**@typedef {{v_x:number[],y:number}[]} dataArrType */
const yFn = (v_w,v_x,b) => nj.sigmoid(nj.array(v_w).dot(v_x).add(b).divide(10))
/**
 * 损失函数 J
 * @param {dataArrType} dataArr 
 */
const J = (dataArr,v_w,b,l = 0) => {
  // debugger
  const regularizationPart = l === 0 ? 0 : v_w.reduce((t,w) => w ** 2 + t,0) * l / 2
  return (regularizationPart - dataArr.reduce((t,{ v_x,y }) => {
    const v = yFn(v_w,v_x,b).get(0)
    return t + y ? Math.log(v) : Math.log(1 - v)
  },0)) / dataArr.length

}

const dJ_dw_j = (dataArr,v_w,b,j,l) => {
  // debugger
  const partA = dataArr.reduce((t,{ v_x,y }) => yFn(v_w,v_x,b).subtract(y).multiply(v_x[j]).add(t),0).get(0)
  return (partA + l * v_w[j]) / dataArr.length
}



const dJ_db = (dataArr,v_w,b) => {
  return dataArr.reduce((t,{ v_x,y }) => yFn(v_w,v_x,b).subtract(y).add(t),0).divide(dataArr.length).get(0)
}


function gradientDescent(dataArr,num_iters,v_w_in,b_in,L,l) {

  let v_w = v_w_in,b = b_in
  let cost
  for (let i = 0; i < num_iters; i++) {
    cost = J(dataArr,v_w,b,l);
    [v_w,b] = [v_w.map((w,j) => w - L * dJ_dw_j(dataArr,v_w,b,j,l)),b - L * dJ_db(dataArr,v_w,b)];
  }

  return {
    v_w,b,cost,num_iters,L,l
  }
}

module.exports = { gradientDescent }
// console.log('1',1)
// J([{ v_x: [1,2,3],y: 1 }],[0.2,0.3,0.4],2)
// debugger
