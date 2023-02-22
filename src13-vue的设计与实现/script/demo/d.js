let a = [
  [0.9,0.3,0.4],
  [0.2,0.8,0.2],
  [0.1,0.5,0.6],
]
let b = [
  [0.9],
  [0.1],
  [0.8],
]
function sigmoid(x) {
  return 1 / (Math.exp(-x) + 1)
}
const getCol = (m,n) => m.map(v => v[n])
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
  // return a.reduce((t1,v1,i) => {
  //   let res = v1.reduce((t2,v2,j) => v2 * getCol(b,0)[j] + t2,0)
  //   t1.push([res])
  //   return t1
  // },[])
}
let res = mutiplyMatrix(a,b)

let res2 = res.map(v => v.map(w => sigmoid(w)))

console.log('mutiplyMatrix(a,b)',res)
console.log('res2',res2)
debugger