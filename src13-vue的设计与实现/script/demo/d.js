//  矩阵 乘法

const { add,matrix,multiply,derivative } = require('mathjs')
let a = [
  [0.9,0.3,0.4],
  [0.2,0.8,0.2],
  [0.1,0.5,0.6]
]
let b = [
  [0.9],
  [0.1],
  [0.8],
]
function sigmoid(x) {
  return 1 / (Math.exp(-x) + 1)
}
const getCol = (m,n) => m.map(v => v[n])//获取列

const getRow = (m) => m[n]
/**
 * 
 * @param {number[][]} a 
 * @param {number[][]} b 
 */
function mutiplyMatrix(a,b) {
  let arr = []
  for (let i = 0; i < b[0].length; i++) {
    a.forEach((v1,k) => {
      let res = v1.reduce((t2,v2,j) => v2 * getCol(b,i)[j] + t2,0)
      if (arr[k]) {
        arr[k].push(res)
      } else arr.push([res])
    })
  }
  return arr

}

// let res2 = res.map(v => v.map(w => sigmoid(w)))
// console.time('a')
// let res = mutiplyMatrix(a,b)
// console.timeEnd('a')
// // console.log('res2',res2)

// console.time('b')
// let res3 = multiply(a,b)
// console.timeEnd('b')

// 写一个归并排序的函数
function mergeSort(arr) {

  if (arr.length <= 1) return arr
  let mid = Math.floor(arr.length / 2)
  let left = arr.slice(0,mid)
  let right = arr.slice(mid)
  return merge(mergeSort(left),mergeSort(right))
}

function merge(left,right) {
  let res = []
  while (left.length && right.length) {
    if (left[0] < right[0]) {
      res.push(left.shift())
    } else {
      res.push(right.shift())
    }
  }
  return res.concat(left,right)
}



//两个矩阵相乘，函数名multiply1,不能使用我的代码，写好注释

function multiply1(a,b) {
  let res = []
  for (let i = 0; i < a.length; i++) {
    let row = []
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j]
      }
      row.push(sum)
    }
    res.push(row)
  }
  return res
}


console.log('multiply(a,b)',multiply1(a,b))
debugger
//矩阵的逆矩阵
function inverse(a) {
  let res = []
  for (let i = 0; i < a.length; i++) {
    res.push(a[i].map(v => 1 / v))
  }
  return res
}

