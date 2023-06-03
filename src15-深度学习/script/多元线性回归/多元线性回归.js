
const nj = require('../lib/numjs.min.js')

/**
 *  多元线性模型
 * @param {number[]} v_w 多元参数向量 w1-wn
 * @param {number[]} v_x x 参数向量
 * @param {number} b 参数b
 * @returns {number}
 */
const yfn = (v_w,v_x,b) => nj.array(v_w).dot(v_x).get(0) + b
/**
 * 损失函数 J
 * @param {number[]} v_w 多元参数向量 w1-wn
 * @param {dataArr} dataArr 
 * @param {number} l λ
 */
const J = (dataArr,m,v_w,b,l) => {
  const regularizationPart = v_w.reduce((t,w) => w ** 2 + t,0) * l
  return (dataArr.reduce((t,{ v_x,y }) => t + (yfn(v_w,v_x,b) - y) ** 2,0) + regularizationPart) / (2 * m)
}


// 第j个特征 求导
const dj_dw_j = (dataArr,m,v_w,b,j,l) => (dataArr.reduce((t,{ v_x,y }) => t + (yfn(v_w,v_x,b) - y) * v_x[j],0) + l * v_w[j]) / m

// b 
const dj_db = (dataArr,m,v_w,b) => dataArr.reduce((t,{ v_x,y }) => yfn(v_w,v_x,b) - y + t,0) / m


/**
 * 
 * @param {number[]} v_w_in 初始的v_w
 * @param {*} b_in 初始的 b
 * @param {*} dataArr 测试的房屋数据
 * @param {number} L 学习率
 * @param {number} l λ
 * @param {number} m 样本数量
 * 
 */
function gradientDescent(v_w_in,b_in,dataArr,num_iters,L,l) {
  let v_w = v_w_in,b = b_in
  let cost
  const m = dataArr.length


  for (let i = 0; i < num_iters; i++) {
    cost = J(dataArr,m,v_w,b,l);
    [b,v_w] = [b - L * dj_db(dataArr,m,v_w,b),v_w.map((w,j) => w - L * dj_dw_j(dataArr,m,v_w,b,j,l))];
  }
  return {
    v_w,b,cost,num_iters,L,l
  }

}

// gradientDescent([1.1407,13.6593,-1.9777],29.47,dataArr,1000,0.00000635)
// console.log('dataArr',dataArr)
// debugger

module.exports = { gradientDescent }
