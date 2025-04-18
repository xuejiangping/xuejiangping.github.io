
const { setNodeArr,exchangeFn,compareFn,Colors,
  initializeColor
} = require('./utils.js')

// 递归 实现斐波那契
function fb(n) {
  if (n < 1) return 0
  if (n < 3) return 1
  return fb(n - 1) + fb(n - 2)
}

// 循环 实现斐波那契数列
function fb2(n) {
  if (n < 1) return 0
  if (n < 3) return 1
  let f1 = 1,f2 = 1,fn
  for (let i = 2; i < n; i++) {
    fn = f1 + f2
    f1 = f2
    f2 = fn
  }
  return fn
}
/**
 * 洗牌算法，打乱数组顺序
 * @param {Array} arr 
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





class People {
  static amount = 0
  constructor(name) {
    People.amount++
    this.name = name
    this.id = Math.round(Math.random() * 1e10)
    this.relation = {}
    this.friends = {}
  }
  sayHi(somebody) {
    this.increaseFavorability(somebody)
    somebody.increaseFavorability(this)
  }
  increaseFavorability(somebody,n = 1) {
    if (this.relation.hasOwnProperty(somebody.id)) {
      this.relation[somebody.id].favorability += n
    } else {
      this.relation[somebody.id] = { favorability: n }
    }
    console.log(`${this.name} 和 ${somebody.name} 好感度+1 `)
  }


  makeFriend(somebody) {
    let res = somebody.acceptInvitation(this)
    if (res) {
      console.log(`${this.name} 和 ${somebody.name}成为朋友!`)
      this.friends[somebody.id] = somebody
    } else {
      console.log(`你和 ${somebody.name}的好感度不足，暂无法成为朋友，多多和他互动吧`)
    }
  }
  acceptInvitation(somebody) {
    const favorability = this.relation[somebody.id]?.favorability
    if (favorability === undefined || favorability < 5) {
      return false
    } else {
      console.log(`${this.name} 和 ${somebody.name}成为朋友!`)
      this.friends[somebody.id] = somebody
      return true
    }

  }
}

// let zs = new People('张三')
// let ls = new People('李四')
// let wmz = new People('王麻子')
/**
 * 二叉树的遍历
 * 1.前序遍历 当前 左边 右边
 * 2.中序遍历 左边 当前 右边
 * 3.后序遍历 左边 右边 当前 
 */
// 二叉树1 

let [a,b,c,d,e,f,g] = setNodeArr()
a.left = b
a.right = c
b.left = d
b.right = e
c.left = f
c.right = g
// 二叉树2
let [a2,b2,c2,d2,e2,f2,g2] = setNodeArr()
a2.left = b2
a2.right = c2
b2.left = d2
b2.right = e2
c2.left = f2
c2.right = g2

//fl:前序遍历
function fl(root) {
  if (root === null) return
  console.log('root',root.value)
  fl(root.left)
  fl(root.right)
}
// ml:中序遍历
function ml(root) {
  if (root === null) return
  ml(root.left)
  console.log('root',root.value)
  ml(root.right)

}
//ll(later):后序遍历
function ll(root) {
  if (root === null) return
  ll(root.left)
  ll(root.right)
  console.log('root',root.value)

}
// console.group('前序')
// fl(a)
// console.groupEnd('前序')
// console.group('中序')
// ml(a)
// console.groupEnd('中序')
// console.group('后序')
// ll(a)
// console.groupEnd('后序')



let forward = ['A','B','D','E','C','F','G']
let middle = ['D','B','E','A','F','C','G']

function f1() {

}
/**
 * 深度优先搜索 二叉树
 * 缺点 容易爆栈
 * @param {Node} root 
 * @param {*} target 
 */
function deepSearch(root,target) {
  if (root === null) return false
  if (root.value === target) return root
  return deepSearch(root.left,target) || deepSearch(root.right,target)
}
/**
 * 广度优先 搜索
 * 传入一个节点数组，遍历数组若找到则返回目标节点
 * 若未找到，则根据节点数数组，生成新的字节点数组，递归循环
 * @param {Node[]} rootList
 * @param {*} target 目标 
 */
function wideSearch(rootList,target) {
  if (rootList.length === 0) return false
  return rootList.find(root => root.value === target) ||
    wideSearch(rootList.reduce((t,root) => (
      root.left !== null && t.push(root.left),
      root.right !== null && t.push(root.right)
      ,t),[]),target)

}
// console.log("deepSearch(a,'d')",deepSearch(a,'j'))
// console.log("wideSearch([a],'b')",wideSearch([a],'f'))
// c2.left = null

/**
 * 二叉树的比较
 * 该比较不分左右，即 
 * root1.left <==> root2.left
 * root1.left <==> root2.right
 * @param {*} root1 第一个二叉树的根节点
 * @param {*} root2 第二个二叉树的根节点
 * @returns 
 */
function compareTree(root1,root2) {
  if (root1 == null && root2 == null) return true
  if (root1 == null || root2 == null) return false
  return root1.value === root2.value &&
    (compareTree(root1.left,root2.left) &&
      compareTree(root1.right,root2.right)) ||
    (compareTree(root1.left,root2.right) &&
      compareTree(root1.right,root2.left))
}

// console.log('compareTree(a,a2)',compareTree(a,a2))

/**
 * 输出 树1 和 树2 不一样的地方
 * 增加了什么、删除了什么、修改了什么
 * 
 */
//  需要输出的diff列表模板
// let diffList = [
//   {
//     type: '增加了' || '删除了' || '修改了',
//     origin: null,
//     now: null
//   }
// ]
let diffList = []
function diffTree(root1,root2,diffList) {
  if (root1 == root2) return diffList
  if (root1 == null && root2 !== null) {
    diffList.push({
      type: '增加了',
      origin: null,
      now: root2.value
    })
  } else if (root1 !== null && root2 === null) {
    diffList.push({
      type: '删除了',
      origin: root1.value,
      now: null
    })
  } else if (root1.value !== root2.value) {
    diffList.push({
      type: '修改了',
      origin: root1.value,
      now: root2.value
    })
    diffTree(root1.left,root2.left,diffList)
    diffTree(root1.right,root2.right,diffList)
  } else {
    diffTree(root1.left,root2.left,diffList)
    diffTree(root1.right,root2.right,diffList)
  }

}
// a.value = 'q'
// d2.value = 'd2'
// b2.value = 'b2'
// diffTree(a,a2,diffList)
// console.log('diffList',diffList)



/**
 * 图形 数据结构
 * 图的最小生成树的问题
 */

class Graph {
  constructor(isDirected = false) {
    this.isDirected = isDirected; // {1}
    this.vertices = []; // {2} Vex
    this.adjList = new Map(); // {3}
  }
  addVertex(v) {
    if (!this.vertices.includes(v)) { // {5}
      this.vertices.push(v); // {6}
      this.adjList.set(v,[]); // {7}
    }
  }
  addEdge(v,w) {
    if (!this.adjList.get(v)) {
      this.addVertex(v); // {8}
    }
    if (!this.adjList.get(w)) {
      this.addVertex(w); // {9}
    }
    this.adjList.get(v).push(w); // {10}
    if (!this.isDirected) {
      this.adjList.get(w).push(v); // {11}
    }
  }
  getVertices() {
    return this.vertices;
  }
  getAdjList() {
    return this.adjList;
  }
  toString() {
    let str = ''
    this.adjList.forEach((v,k) => {
      str += `${k}  -->  ${v.toString()}\n`
    })
    return str
  }

}

// 构建 用于测试的 图 数据结构
const graph = new Graph()
const myVertices = ['A','B','C','D','E','F','G']
myVertices.forEach(v => graph.addVertex(v))
graph.addEdge('A','C')
graph.addEdge('A','B')
graph.addEdge('B','D')
graph.addEdge('B','E')
graph.addEdge('B','F')
graph.addEdge('C','F')
graph.addEdge('D','F')
graph.addEdge('E','D')
graph.addEdge('E','G')



// console.log(graph.toString())
// console.log('initializeColor(graph.vertices)',initializeColor(graph.vertices))

/**
 * 图的广度优先 搜索
 * 循环起始节点的同一层子树节点
 * @param {Graph} graph 
 * @param {*} startVertex 搜索的起始顶点
 * @param {*} cb 回调函数
 */
function breadthFirstSearchGraph(graph,startVertex,cb) {
  const adjList = graph.getAdjList()
  const vertices = graph.getVertices()
  const color = initializeColor(vertices)
  const queqe = [startVertex]
  const distances = {}  //起始点到各其它顶点距离（边数）
  const predecessors = {}  //回溯点
  vertices.forEach(v => { distances[v] = 0,predecessors[v] = null })
  while (queqe.length > 0) {
    const u = queqe.shift()
    color[u] = Colors.GREY
    const neighbors = adjList.get(u)
    neighbors.forEach(v => {
      if (color[v] === Colors.WHITE) {
        queqe.push(v)
        distances[v] = distances[u] + 1
        predecessors[v] = u
        color[v] = Colors.GREY
      }
    })
    color[u] = Colors.BLACK
    if (cb) cb(u)
  }
  return { distances,predecessors }

}
const testCB = v => console.log('节点：',v)
// let res = breadthFirstSearchGraph(graph,'B',testCB)
// console.log('res',res)

/**
 * 图的深度优先 搜索
 * 通过递归 搜索子树
 * @param {Graph} graph
 */
function depthFirstSearchGraph(graph,startVertex,cb) {
  const adjList = graph.getAdjList()
  const vertices = graph.getVertices()
  const color = initializeColor(vertices)
  const depthFirstSearchVisit = (u,cb) => {
    if (cb) cb(u)
    color[u] = Colors.GREY
    const neighbors = adjList.get(u)
    neighbors.forEach(v => {
      if (color[v] === Colors.WHITE) {
        depthFirstSearchVisit(v,cb)
      }
    })
    color[u] = Colors.BLACK
  }
  depthFirstSearchVisit(startVertex,cb)
}

// depthFirstSearchGraph(graph,'C',testCB)

/**
 * 测试图 2 
 */
const graph2 = new Graph(true)
const myVertices2 = ['A','B','C','D','E','F']
myVertices2.forEach(v => graph2.addVertex(v))

graph2.addEdge('A','C')
graph2.addEdge('A','D')
graph2.addEdge('B','D')
graph2.addEdge('B','E')
graph2.addEdge('C','F')
graph2.addEdge('F','E')

console.log('graph2',graph2)







