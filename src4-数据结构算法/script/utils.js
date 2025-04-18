/**
 * 双向链表
 * 优点：能从任意节点 遍历整条链表
 * 缺点：耗费存储空间
 */
class Node {
  constructor(value) {
    this.value = value
    this.next = null
    this.prev = null
    this.left = null
    this.right = null
  }
}
/**
 * 比较 和 交换 工具函数
 */
const compareFn = (a,b) => a > b
const exchangeFn = (arr,i,j) => ([arr[j],arr[i]] = [arr[i],arr[j]],arr)
const setNodeArr = (length = 7) => Array.from({ length },(_,i) => new Node(String.fromCharCode(97 + i)))
/**
 * 生成测试随机数组
 */
function randomIntArray(length = 5,range = 100) {
  return Array.from({ length },() => Math.round(Math.random() * range))
}
const Colors = {
  WHITE: 0, //表示该顶点还没有被访问。
  GREY: 1,  //表示该顶点被访问过，但并未被探索过
  BLACK: 2  //表示该顶点被访问过且被完全探索过。
}
/**
 * 初始化图颜色
 * @param {Array} vertices 图顶点集合
 * @returns {object}
 */
const initializeColor = vertices => vertices.reduce((t,v) => (t[v] = Colors.WHITE,t),{})

module.exports = {
  initializeColor,
  compareFn,
  exchangeFn,
  setNodeArr,
  randomIntArray,
  Colors
}



