/**
 *  冒泡排序123123
 */

const compareFn = (a,b) => a > b
const exchangeFn = (arr,i,j) => ([arr[j],arr[i]] = [arr[i],arr[j]],arr)

let arr = [24,4,1,41,6,47]

/**
 * 核心：
 *    1. 比较
 *    2. 交换
 * @param {number[]} arr 待排序数组
 * @returns 排序后的数组
 */
function sort2(arr) {
  const length = arr.length
  for (let k = 0; k < length - 1; k++) {
    for (let i = 0; i < length - k; i++) {
      let j = i + 1
      if (j === arr.length) break
      if (compareFn(arr[i],arr[j])) exchangeFn(arr,i,j)
    }
  }
  return arr
}
/**
 * 生成测试随机数组
 */
function randomIntArray(length = 5,range = 100) {
  return Array.from({ length },() => Math.round(Math.random() * range))
}
// console.log('sort1(arr)',sort1(arr))
// console.log('sort2(arr)',sort2(randomIntArray(5)))

/**
 * 选择排序
 */

function selectSort(arr) {
  const length = arr.length
  for (let j = 0; j < length - 1; j++) {
    let tempIndex = 0
    for (let i = 0; i < length - j; i++) {
      if (compareFn(arr[i],arr[tempIndex])) tempIndex = i
    }
    exchangeFn(arr,tempIndex,length - 1 - j)
  }
  return arr
}

console.log('selectSort(randomIntArray(5))',selectSort(randomIntArray(5)))