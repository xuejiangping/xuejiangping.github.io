function arrange(name) {
  console.log(name,'任务已开始')
  const taskList = []

  const asleep = (ms) => new Promise(resolve => setTimeout(resolve,ms))
  return {
    wait(time) {

      taskList.push(() => {
        console.log('等待时间：',time)
        return asleep(time)
      })
      return this
    },
    doSomething(what) {
      taskList.push(() => console.log('开始做：',what))
      return this
    },
    waitFirst(time) {
      taskList.unshift(() => {
        console.log('waitFirst等待时间:',time)
        return asleep(time)
      })
      return this
    },
    execute() {
      console.log('taskList',taskList)
      !async function () { for (let task of taskList) { await task() } }()

    }
  }

}


// arrange('测试').doSomething('唱歌').wait(3000).doSomething('跳舞').wait(1000).doSomething('玩游戏').waitFirst(2000).execute()

function traverse(res = '',...items) {
  if (items.length > 0) {
    // debugger
    let temp = items.shift()
    for (const item of temp) {
      traverse(res + item,...items)
    }

  } else {
    console.log('res',res)
  }
  // debugger
}
// console.log("traverse([1,2],['a','b'])",traverse('',['x','y'],[1,2],['a','b']))


var dataList = [{
  id: 0,
  name: 'Tony',
  food: ['apple','peach','coconut']
}]
let b = dataList.map(item => item.food.join(',')).join(',')
console.log('b',b)



