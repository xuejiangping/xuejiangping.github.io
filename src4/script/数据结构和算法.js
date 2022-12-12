/**
 * 比较 和 交换 工具函数
 */
const compareFn = (a,b) => a > b
const exchangeFn = (arr,i,j) => ([arr[j],arr[i]] = [arr[i],arr[j]],arr)

/**
 * 生成测试随机数组
 */
function randomIntArray(length = 5,range = 100) {
  return Array.from({ length },() => Math.round(Math.random() * range))
}
/**
 * 洗牌算法，打乱数组顺序
 * @param {*} arr 
 * @returns 
 */
function shuffle(arr) {
  const setRandomIndex = () => Math.floor(Math.random() * arr.length)
  for (let i = 0; i < arr.length; i++) {
    exchangeFn(arr,i,setRandomIndex())
  }
  return arr
}

/**
 *  冒泡排序
 */

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

// console.log('selectSort(randomIntArray(5))',selectSort(randomIntArray(5)))

/**
 * 简易快速排序
 * 1.取数组第一个，比它小的放左边，比它大的放右边
 */
function quickSort(arr) {
  if (arr.length <= 1) return arr
  const middleIndex = Math.floor(arr.length / 2)
  const leader = arr.splice(middleIndex,1)[0]
  let left = [],right = []
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i]
    item < leader ? left.push(item) : right.push(item)
  }
  return quickSort(left).concat(leader,quickSort(right))
}
// let randomArr = randomIntArray(10)
// console.log('randomArr',randomArr)
// console.log('quickSort(randomArr)',quickSort(randomArr))

/**
 * 标准的快速排序
 * 
 */

function quickSort2(arr,start,end) {
  if (arr.length <= 1) return arr
  let leader = arr[0]
  let left = start,right = end
  while (left < right) {
    while (arr[left++] <= leader) { }
    while (arr[right--] > leader) { }
    exchangeFn(arr,left,right)

  }
  return arr
}
// console.log(quickSort2(arr,0,arr.length - 1))

/**
 *    栈
 */

class Stack {
  arr = []
  length = 0
  enqueue(v) {
    this.arr.push(v);
    return ++this.length
  }
  dequeue() {
    if (this.length === 0) throw Error('队列为空')
    this.length--
    return this.arr.pop()

  }
}

// let a = new Stack()
// console.log('a',a)

/**
 * Queue
 */

class Queue {
  arr = []
  length = 0
  enqueue(v) { this.arr.push(v) }
  dequeue() { this.arr.shift() }
}

/**
 * 双向链表
 * 优点：能从任意节点 遍历整条链表
 * 缺点：耗费存储空间
 */
function Node(value) {
  this.value = value
  this.next = null
  this.prev = null
}