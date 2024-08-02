/**
 * 
 * @param {Promise[]} arr 
 */

import { prices } from './data.mjs';

/**
 * 手写promiseAll
 * @param {*} arr 
 * @returns 
 */
function P_A(arr) {
  return new Promise((res,rej) => {
    let val = [],j = 0
    arr.forEach((v,i) => {
      v.then(r => {
        val[i] = r;
        if (++j === arr.length) res(val)
      }).catch(err => {
        console.log('val',val)
        rej(err)
      })
    })
  })

}

const asleep = (t) => new Promise(res => setTimeout(res,t,t))


// asleep(2000).then(console.log)

// P_A([asleep(1000),asleep(2000),asleep(3000),asleep(2009).then(r => Promise.reject(r))])
//   .then(r => console.log('all: ',r)).catch(console.log)

/**
 * 控制 异步任务队列
 * @param  {...Function} tasks 
 */
function processTasks(...tasks) {

  let index = 0,isRunning = false
  const res = []
  return {
    async start() {
      return new Promise(async reslove => {
        if (isRunning) return
        isRunning = true
        while (index < tasks.length) {
          console.log('任务',index + 1,'开始')
          try {
            res.push(await tasks[index]())
          }
          catch (err) {
            console.log('任务',index + 1,'失败')
            continue
          }
          finally {
            console.log('任务',index + 1,'结束')
            index++
            if (!isRunning) return
          }


        }
        reslove(res)
        isRunning = false
      })


    },
    pause() {
      // debugger
      if (isRunning) isRunning = false
    }
  }
}

const tasks = [() => asleep(1000),() => asleep(3333),() => 123,() => Promise.reject('失败'),() => asleep(0)]

const process = processTasks(...tasks)
function start() {
  console.log('start')
  process.start().then(console.log)

}

function pause() {
  console.log('pause')
  process.pause()
}
/**
 * 买股票最佳时机
 * @param {number[]} prices 
 * @returns 
 */
function maxProfit(prices) {

  let max,min,res = 0,maxIndex = -1,minIndex = -1
  let tempArr = prices
  while (true) {

    if (tempArr.length < 1) return res

    max = Math.max(...tempArr)
    maxIndex = prices.indexOf(max,maxIndex + 1)
    min = Math.min(...prices.slice(minIndex + 1,maxIndex))
    minIndex = prices.indexOf(min,minIndex + 1)
    res = Math.max(max - min,res)
    console.log(max,min,max - min)
    tempArr = tempArr.slice(maxIndex + 1)
  }
};

let res = maxProfit(prices)
console.log('res',prices.length.toExponential())

