const houseData = require('../../assets/houseData.json')
const houseData2 = require('../../assets/houseData2.json')



/**
 *  @param {[xi:number,yi:number][]} dataArr
 */
function start(dataArr) {

  //线性函数模板

  const yFn = (w,b,x) => w * x + b
  // 样本数量
  const m = dataArr.length
  /**
 * 损失函数 J
 * @param {number} w 
 * @param {number} b 
 */
  const J = (w,b) => dataArr.reduce((t,[xi,yi]) => t + (yFn(w,b,xi) - yi) ** 2,0) / (m * 2)

  // 获取 w，b关于 损失函数J的 导数
  const get_dj_wb = (w,b) => dataArr.reduce((t,[xi,yi],i) => {
    t.dj_dw += (yFn(w,b,xi) - yi) * xi
    t.dj_db += (yFn(w,b,xi) - yi)
    if (i + 1 === m) {
      t.dj_dw /= m
      t.dj_db /= m
    }
    return t
  },{ dj_dw: 0,dj_db: 0 })


  /**
   * 
   * @param {number} w_in w初始值
   * @param {number} b_in b的初始值
   * @param {number} L 学习率
   * @param {number} inaccuracy 最大误差值
   * @param {number} num_iters 循环次数
   * @returns 
   */
  const gradient_descent = (w_in,b_in,L,inaccuracy,num_iters) => {
    //初始参数 w ,b
    let w = w_in,b = b_in,cast
    //开始训练
    for (let i = 0; i < num_iters; i++) {

      let { dj_dw,dj_db } = get_dj_wb(w,b)

      if (i == 1 || i == num_iters - 1) {
        console.table({ i,dj_dw,dj_db })
      }
      w = w - L * dj_dw
      b = b - L * dj_db
      cast = J(w,b)
      // console.table({
      //   cast,w,dj_dw,b,dj_db
      // })

    }
    console.table({
      cast,w,b
    })
  }
  gradient_descent(0,0,0.000005,1e3,10000000)

}

const testDataArr = houseData.map(({ s,p }) => [s,p])
// start([[1,1],[2,2],[3,3],[4,4],[5,5],[6,6]])
start(testDataArr)

// console.log('houseData.map(({s,p})=>[s,p])',houseData.map(({ s,p }) => [s,p]))
// debugger