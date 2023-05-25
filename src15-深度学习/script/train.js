const { gradientDescent } = require('./多元线性回归/多元线性回归.js')
const { writeFile } = require('fs/promises')
const path = require('path')
const houseData = require('../assets/多元参数房价数据.json')
/**
 * 格式化初始数据
 * @param {[]} houseData 
 * @returns {{v_x:[size,numsOfBedroom,ageOfHouse],y:number}}
 */
const formathouseData = (houseData) => (
  houseData.map(({ size,numsOfBedroom,ageOfHouse,price }) => {
    return ({ v_x: [size,numsOfBedroom,ageOfHouse],y: price })
  })
)





const processIndex = process.argv[2]
// console.log('processIndex',processIndex)
const log = (...msg) => console.log(`[${new Date().toLocaleTimeString()}]:`,...msg)

/**
 * 更新 训练数据
 * @param {{v_w,b,dataArr,num_iters,L,l}} result 
 */
function updateArguments(result,path,lastCost) {
  if (result) {
    if (lastCost && result.cost >= lastCost) {
      log(`数据不符合预期，取消本次数据更新`)
    } else {
      writeFile(path,JSON.stringify(result)).then(() => {
        log(`子进程 ${processIndex} :'更新参数数据成功'`,'cost',result.cost)
        console.table(result)
      }).catch((err) => log(`子进程 ${processIndex} :'更新参数失败'`,err))
    }

  }
}

const linear_regression = () => {
  const argumentsPath = path.join(__dirname,'../assets/train-argumetns.json')
  const { v_w,b,L,num_iters,l,cost } = require(argumentsPath)
  const dataArr = formathouseData(houseData)
  const result = gradientDescent(v_w,b,dataArr,num_iters,L,l)
  updateArguments(result,argumentsPath,cost)

}
const logistic_regression = () => {

}


linear_regression()
// module.exports = {
//   linear_regression
// }