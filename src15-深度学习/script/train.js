const { writeFile } = require('fs/promises')
const path = require('path')
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
const formatCancerData = (data) => data.map(({ size,age,ill }) => ({ v_x: [size,age],y: ill }))







const processIndex = process.argv[2]
// console.log('processIndex',processIndex)
const log = (...msg) => console.log(`[${new Date().toLocaleTimeString()}]:`,...msg)

/**
 * 更新 训练数据
 * @param {{v_w,b,dataArr,num_iters,L,l}} result 
 */
function updateArguments(result,path,lastCost) {
  return new Promise(res => {
    if (result) {
      if (lastCost && result.cost >= lastCost) {
        log(`数据不符合预期，取消本次数据更新`,result.cost)
      } else {
        writeFile(path,JSON.stringify(result,null,'\t')).then(() => {
          res()
          log(`子进程 ${processIndex} :'更新参数数据成功'`,'cost',result.cost)
          console.table(result)
        }).catch((err) => log(`子进程 ${processIndex} :'更新参数失败'`,err))
      }

    }
  })

}

const linear_regression = () => {
  const { gradientDescent } = require('./多元线性回归/多元线性回归.js')
  const houseData = require('../assets/多元参数房价数据.json')

  const argumentsPath = path.join(__dirname,'../assets/house-argumetns.json')
  const { v_w,b,L,num_iters,l,cost } = require(argumentsPath)
  const dataArr = formathouseData(houseData)
  const result = gradientDescent(v_w,b,dataArr,num_iters,L,l)
  updateArguments(result,argumentsPath,cost)

}
const logistic_regression = () => {
  const { gradientDescent } = require('./逻辑回归/逻辑回归.js')

  const argumentsPath = path.join(__dirname,'../assets/cancer-arguments.json')
  const cancerData = require('../assets/cancerData.json')
  const { v_w,b,L,num_iters,l,cost } = require(argumentsPath)
  const dataArr = formatCancerData(cancerData)

  if (!v_w) {
    const initArguments = { v_w: [0,0],b: 0,L: 0.000001,num_iters: 1000,l: 0,cost: 0 }
    updateArguments(initArguments,argumentsPath).then(logistic_regression)
  } else {
    // console.log('dataArr',dataArr)
    const result = gradientDescent(dataArr,num_iters,v_w,b,L,l)
    updateArguments(result,argumentsPath,cost)
  }

}

logistic_regression()
// linear_regression()
// module.exports = {
//   linear_regression
// }