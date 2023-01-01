
const getRandomArr = (length = 20,range = 10) => Array(length).fill().map(() => Math.round(Math.random() * range))

/**
 * 从数组中找出和为 target的值
 * @param {number[]} arr 
 * @param {number} target 
 * @param {number[]} resArr 
 */
function test1(arr,target) {
  const getTarget = (arr,target,resArr) => {
    console.count('a')
    arr = arr.filter(v => v <= target)
    if (arr.length < 1) return
    if (arr.includes(target)) return resArr.concat(target)
    resArr.push(arr[0])
    return getTarget(arr.slice(1),target - arr[0],resArr)
  }

  return arr.reduce((t,v,i) => {
    let res = getTarget(arr.slice(i + 1),target - v,[v])
    res && t.push(res)
    return t
  },[])
}





/**
 * 找出参数数组 中不同之处
 * @param  {...number[]} args 
 * @returns 
 */
function sym(...args) {
  /**
   * 
   * @param {Array} arr1 
   * @param {Array} arr2 
   * @returns 
   */
  const diffFn = (arr1,arr2) => arr1.filter(v => !arr2.includes(v)).concat(arr2.filter(v => !arr1.includes(v)))
  let res = args.reduce((t,v,i) => i > 0 ? diffFn(t,v) : t,args[0])
  res = [...new Set(res)].sort()
  return res;
}

// let res = sym([1,2,3],[5,2,1,4]);
// console.log('res',res)
/**
 * 利用arr2更新 arr1
 * @param {[][]} arr1 
 * @param {[][]} arr2 
 * @returns 
 */
function updateInventory(arr1,arr2) {

  arr2.forEach(v => {
    let a = arr1.find(w => w[1] === v[1])
    if (a) {
      a[0] += v[0]
    } else {
      arr1.push(v)
    }
  })

  return arr1
}



// let res = updateInventory(curInv,newInv);

// let a = updateInventory([[21,"Bowling Ball"],[2,"Dirty Sock"],[1,"Hair Pin"],[5,"Microphone"]],[[2,"Hair Pin"],[3,"Half-Eaten Apple"],[67,"Bowling Ball"],[7,"Toothpaste"]])
// console.log('a',a)


/**
 * 返回字符串字符所组合的新字符串中没有重复连续字母的提供字符串的总排列数
 * @param {string} str 
 */
function permAlone(str) {
  let strArr = [...str]
  let resArr = []
  /**
   * 判断字符串是否有重复:如 abb
   */
  const isRepeated = targetStr => {
    if (targetStr.length < 2) return false
    for (let i = 1; i < targetStr.length; i++) {
      if (targetStr[i] === targetStr[i - 1]) return true
    }
    return false
  }
  /**
   * 循环函数
   * @param {[]} strArr 
   * @param {string} resStr  
   */
  let fn = (strArr,resStr) => {
    //判断循环结束 ，以及结束时循环结果字符串是否为重复的：如aabc 
    if (strArr.length === 0 && !isRepeated(resStr)) return void resArr.push(resStr)
    for (let i = 0; i < strArr.length; i++) {
      let newStrArr = strArr.slice()
      let item = newStrArr.splice(i,1)
      fn(newStrArr,resStr + item)
    }
  }
  fn(strArr,'')

  return resArr
}

// let res = permAlone('aabb');
// console.log('res',res)


function pairwise(originalArr,originTarget) {
  let resArr = []
  /**
 * @param {[]} arr 
 * @param {number} target  
 * @param {[]} tempResArr  
 * 
 */
  const fn = (arr,target,tempResArr) => {
    arr = arr.filter(v => v <= target)
    let { length } = arr
    if (length < 1) return
    if (arr.includes(target)) return void resArr.push(tempResArr.concat(target))
    let item = arr[length - 1]
    fn(arr.slice(0,length - 1),target - item,tempResArr.concat(item))
  }

  for (let i = originalArr.length - 1; i > 0; i--) {
    let item = originalArr[i]
    if (item === 0) continue
    fn(originalArr.slice(0,i),originTarget - item,[item])
  }


  // fn(originalArr,originTarget,[])


  return resArr;
}

// let res = pairwise(arr2,10);
// console.log('res',res)

function selectionSort(array) {
  let exchangeFn = (arr,i,j) => [arr[j],arr[i]] = [arr[i],arr[j]]
  let { length } = array
  for (let j = 0; j < length - 1; j++) {
    let index = j
    for (let i = j + 1; i < length; i++) {
      if (array[i] > array[index]) index = i
    }
    exchangeFn(array,index,j)
  }
  return array
}
/**
 * 
 * @param {[]} array 
 * @returns 
 */
function quickSort(array) {
  // 只修改这一行下面的代码
  let { length } = array
  if (length < 2) return array
  let middleIndex = Math.floor(length / 2)
  let middleValue = array.splice(middleIndex,1)
  // let middleValue = array.splice(0,1)
  let [left,right] = array.reduce((t,v) => (v <= middleValue ? t[0].push(v) : t[1].push(v),t),[[],[]])
  return quickSort(left).concat(middleValue,quickSort(right));

}

// let res1 = quickSort(getRandomArr(1000000,10000))
// let res2 = selectionSort(getRandomArr(100,100))


/**
 * 二分搜索
 * @param {number[]} searchList 
 * @param {number} value 
 * @returns 
 */
function binarySearch(searchList,value,arrayPath = []) {
  // let arrayPath = [];
  let { length } = searchList
  if (length < 1) return 'Value Not Found'
  let middleIndex = Math.floor(length / 2)
  let middleValue = searchList[middleIndex]
  arrayPath.push(middleValue)
  if (middleValue === value) {
    return arrayPath
  } else if (middleValue > value) {
    return binarySearch(searchList.slice(0,middleIndex),value,arrayPath)
  } else {
    return binarySearch(searchList.slice(middleIndex + 1),value,arrayPath)
  }
  // return arrayPath;
}

// let res = binarySearch(Array(100).fill().map((_,i) => i),444)
/**
 * 
 * @param {boolean[]} numDoors 
 */
function getFinalOpenedDoors(numDoors) {
  for (let i = 1; i <= numDoors.length; i++) {
    for (let j = 0; j < numDoors.length; j += i) {
      numDoors[j] = !numDoors[j]
      // console.log(i,j)
    }
  }
  return numDoors.reduce((t,v,i) => (v && t.push(i),t),[])


}
// let numDoors = Array(100).fill(false)
// let res = getFinalOpenedDoors(numDoors)


/**
 * 利用所给数字字符串 的数字凑24
 * @param {array} numStr 
 * @returns 
 */
function solve24(numStr,num = 24) {
  // 根据数字字符串 生成加减乘除的可运算组合数组
  function a(numStr) {
    let operators = [...'+-*/']
    let resArr = []
    let fn = (str,i = 1) => {
      if (i > numStr.length - 1) return resArr.push(str)
      operators.forEach(v => {
        fn(str + v + numStr[i],i + 1)
      })
    }
    fn(numStr[0])
    return resArr;
  }
  // 根据数字字符串 生成所有可能组合：1234=>2134=>3124 ...
  function permAlone(numStr) {
    let strArr = [...numStr]
    let resArr = []

    let fn = (strArr,resStr = '') => {
      if (strArr.length === 0) return void resArr.push(resStr)
      for (let i = 0; i < strArr.length; i++) {
        let newStrArr = strArr.slice()
        let item = newStrArr.splice(i,1)
        fn(newStrArr,resStr + item)
      }
    }
    fn(strArr)

    return resArr
  }
  // 给可运算组合数组中字符加 括号 ：1+2*3+4=>(1+2)*(3+4)
  function c(str) {
    let resArr = [str]
    let insert = (a,i,v) => {
      let arr = [...a]
      arr.splice(i,0,...v)
      return arr.join('')
    }
    str = '(' + str
    let v1 = insert(str,4,[')'])
    let v2 = insert(v1,6,['('])
    resArr.push(v1,insert(str,6,[')']),insert(v2,10,[')']))
    return resArr
  }
  let resArr = permAlone(numStr).flatMap(v => a(v)).flatMap(v => c(v))
  return resArr.map(v => ({ [v]: eval(v) }))
  // return resArr.filter(v => eval(v) === num)


}
// let res = solve24('3459',55)
// console.log('res',res)

// debugger
