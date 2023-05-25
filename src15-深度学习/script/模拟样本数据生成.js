const fs = require('fs')
const path = require('path')
// 面积 卧室个数 房龄

const housePriceFn = (x1,x2,x3) => 1.2 * x1 + 0.5 * x2 - 2 * x3 + 50
// 肿瘤大小：0.5  患者年龄：0.4 基数b：10
const cancerPredictFn = (x1,x2) => 1 / (1 + Math.exp(-(0.5 * x1 + 0.4 * x2 + 10)))

const randomNum = (min,max) => Math.round(Math.random() * (max - min)) + min
const fileName = './fangjia.csv'

function simulatedData(targetFn,length) {
  return Array(length).fill().map((_,i) => {
    let size = 60 + i * 30 + randomNum(-2,2) * i
    let numsOfBedroom = Math.floor(2 + i * 0.3 + randomNum(-1,1))
    let ageOfHouse = Math.ceil(randomNum(1,40))
    let price = targetFn(size,numsOfBedroom,ageOfHouse) + randomNum(-5,5) * i
    return { size,numsOfBedroom,ageOfHouse,price }
  })
}

function createCsvFile(dataArr,fileName) {
  dataArr.forEach((v,i) => {
    const keys = Object.keys(v),values = Object.values(v)
    if (i === 0) {
      const title = `${keys.join()}\n`
      fs.writeFileSync(fileName,title,{ flag: 'a',encoding: 'utf-8' })
    } else {
      const row = `${values.join()}\n`
      fs.writeFileSync(fileName,row,{ flag: 'a' })
    }
  })
}
// createCsvFile(simulatedData(targetFn,30),'./多元参数房价数据.csv')
// fs.writeFileSync(path.join(__dirname,'../assets/多元参数房价数据.json'),JSON.stringify(simulatedData(housePriceFn,30)))
let b = Array(20).fill().map(v => {
  let size = randomNum(3,10)
  let age = randomNum(25,60)
  let ill = size * 0.1 + age * 0.01 > 1

  return {
    size,age,ill
  }
})
fs.writeFileSync(path.join(__dirname,'../assets/cancerData.json'),JSON.stringify(b))
