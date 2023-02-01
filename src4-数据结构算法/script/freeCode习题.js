const { Worker,isMainThread } = require('node:worker_threads');
const { ReadableStream,WritableStream } = require('stream/web');
const { WriteStream,createWriteStream } = require('node:fs');
const { thousandDigits } = require('./data.js')
const path = require('node:path');
//#region 基础数据
const romanUnit = [["M","1000"],["CM","900"],["D","500"],["CD","400"],["C","100"],["XC","90"],["L","50"],["XL","40"],["X","10"],["IX","9"],["V","5"],["IV","4"],["I","1"]]
const currencyUnit = new Map([["PENNY",0.01],["NICKEL",0.05],["DIME",0.1],["QUARTER",0.25],["ONE",1],["FIVE",5],["TEN",10],["TWENTY",20],["ONE HUNDRED",100]])
//#endregion

//#region 试题函数
function checkCashRegister(price,cash,cid) {
  let change = [];

  // let cidDict = new Map(cid)
  // console.log('cid.reduce((t,v)=>t+v[1],0)',cid.reduce((t,v) => +(t + v[1]).toPrecision(5),0))
  const needChange = +(cash - price).toPrecision(5)
  let selectableCid = cid.filter(v => currencyUnit.get(v[0]) <= needChange)
  let totalCid = selectableCid.reduce((t,v) => t + v[1],0)
  // 第一种情况 不够找零金额
  if (needChange > totalCid) return { msg: '不够找零金额',status: "INSUFFICIENT_FUNDS",change }
  // 第二种   够找零
  let tempChange = needChange
  for (let i = selectableCid.length - 1; i >= 0; i--) {
    // 优先使用大面值找零
    const [key,value] = selectableCid[i]
    const faceValue = currencyUnit.get(key)
    if (faceValue > tempChange || value === 0) continue
    if (value >= tempChange) { //当前面值的零钱总额大于等于须找零总额
      let a = tempChange / faceValue
      if (Number.isSafeInteger(a)) { //当前面值可完整找零
        change.push([key,tempChange])
        return { msg: '找零成功',status: needChange === totalCid ? "CLOSED" : 'OPEN',change }
      } else { //当前面值无法完整找零
        let partChange = Math.floor(a) * faceValue
        change.push([key,partChange])
        tempChange = +(tempChange - partChange).toPrecision(5)
      }
    } else {  ////当前面值的零钱总额不足找零总额，使用下一种面额不足
      change.push([key,value])
      tempChange = +(tempChange - value).toPrecision(5)
    }
  }
  return { msg: '找零失败，无法凑出相应找零面值',status: "INSUFFICIENT_FUNDS",change }
  // return change;
}
// let res = checkCashRegister(19.5,20,[["PENNY",1.01],["NICKEL",2.05],["DIME",3.1],["QUARTER",4.25],["ONE",90],["FIVE",55],["TEN",20],["TWENTY",60],["ONE HUNDRED",100]]);
// console.log('res',res)

// let res = checkCashRegister(19.5,20,[["PENNY",0.5],["NICKEL",0],["DIME",0],["QUARTER",0],["ONE",0],["FIVE",0],["TEN",0],["TWENTY",0],["ONE HUNDRED",0]])
// console.log('res',res)
function palindrome(str) {
  let myReg = /\W|_/g
  let newStr = str.replace(myReg,'').toLowerCase()
  let newStr2 = newStr.split('').reverse().join('')
  console.log(newStr,newStr2)
  return newStr === newStr2;
}
// let testStr = "A man, a plan, a canal. Panama"
// palindrome(testStr);

function convertToRoman(num) {
  const selectableRomanUnit = romanUnit.filter(v => v[1] <= num)
  let tempNum = num,res = ''
  for (let i = 0; i < selectableRomanUnit.length; i++) {
    const [key,value] = selectableRomanUnit[i]
    if (value > tempNum) continue
    let a = tempNum / value
    if (Number.isSafeInteger(a)) {
      return res += key.repeat(a)
    } else {
      tempNum %= value
      res += key.repeat(Math.floor(a))
    }

  }
  // console.log(selectableRomanUnit)
  return '未知错误：' + res;
}

// let res = convertToRoman(8334);
// console.log('res',res)
/**
 * 
 * @param {string} str 
 * @param {*} step 
 * @returns 
 */
function rot13(str,step = 13) {
  let strArr = str.split(''),myReg = /[a-z]/i

  for (let i = 0; i < strArr.length; i++) {
    let item = strArr[i]
    if (myReg.test(item)) {
      let charCode = item.charCodeAt()
      let newCharCode = charCode - step
      if (newCharCode < 65) {
        newCharCode += 26
      }
      strArr[i] = String.fromCharCode(newCharCode)
    }
  }
  return strArr.join('');
}

// let res = rot13("SERR PBQR PNZC");
// console.log('res',res)




function smallestCommons(arr) {
  arr = arr.sort((a,b) => a - b)
  let min = arr[0],max = arr[1]
  let getDividers = (a,b) => Array.from({ length: b - a - 1 },(_,i) => a + i + 1)
  let getCom = ((i,limit = 1e6) => (a,b) => {
    if (i > limit) throw new Error('计算量太大,建议输入较小两个数再试,已尝试的次数: ' + i)
    return (a === 1 || b % a !== 0) ? a * b * i++ : b * i++
  })(1)
  let dividers = getDividers(min,max)
  while (true) {
    let com = getCom(min,max)
    // 若a,b公倍数可以被 a,b 直接所有数整除则返回结果
    if (dividers.every(v => com % v === 0)) return com
  }
}

// console.log('smallestCommons([2,10])',smallestCommons([2,8]))
// const Person = function (firstAndLast) {
//   this._fullName = firstAndLast
//   this.getFirstName=function(){}
//   this.getLastName=function(){}
//   this.getFullName=function(){}

//   this.setFirstName=function(){}
//   this.setLastName=function(){}
//   this.setFullName=function(){}

// };

// class Person {
//   constructor(firstAndLast) {
//     this.setFullName(firstAndLast)
//   }

//   parseFullName(fullName) { return fullName.split(/\s+/) }
//   getFirstName() { return this._firstName }
//   getLastName() { return this._lastName }
//   getFullName() { return this._firstName + ' ' + this._lastName }

//   setFirstName(firstName) { this._firstName = firstName }
//   setLastName(lastName) { this._lastName = lastName }
//   setFullName(fullName) {

//     let arr = this.parseFullName(fullName)
//     this.setFirstName(arr[0])
//     this.setLastName(arr[arr.length - 1])
//   }
// }

// function Person(firstAndLast) {
//   this.getFirstName = function () {
//     return firstAndLast.split(' ')[0]
//   }
//   this.getLastName = function () {
//     return firstAndLast.split(' ')[1]
//   }
//   this.getFullName = function () {
//     return firstAndLast
//   }
//   this.setFirstName = function (first) {
//     let nameArr = firstAndLast.split(' ')
//     nameArr[0] = first
//     firstAndLast = nameArr.join(' ')
//   }
//   this.setLastName = function (last) {
//     let nameArr = firstAndLast.split(' ')
//     nameArr[1] = last
//     firstAndLast = nameArr.join(' ')
//   }
//   this.setFullName = function (fullName) {
//     firstAndLast = fullName
//   }
// }

// const bob = new Person('Bob Ross');

function orbitalPeriod(arr) {
  const GM = 398600.4418;
  const earthRadius = 6367.4447;
  let getOrbitalPeriod = (avgAlt) => 2 * Math.PI * Math.sqrt(Math.pow(earthRadius + avgAlt,3) / GM)
  let res = arr.map(({ name,avgAlt }) => ({ name,orbitalPeriod: Math.round(getOrbitalPeriod(avgAlt)) }))
  return res;
}

// let res = orbitalPeriod([{ name: "sputnik",avgAlt: 35873.5553 }]);
// console.log('res',res)

//#endregion

//#region nodejs 中的工作者线程使用
/* let scriptStr = `
  const { parentPort,isMainThread, workerData} = require('node:worker_threads');
  console.log('isMainThread',isMainThread)
  if (!isMainThread){
    let data={msg:'你好,消息来自工作者线程',workerData}
    setTimeout(()=>parentPort.postMessage(data),2000)
  }
`

console.log('isMainThread123',isMainThread)

if (isMainThread) {
  let worker = new Worker(scriptStr,{ eval: true,workerData: '哈哈哈哈' })
  worker.on('message',(data) => {
    console.log(data)
  })
}
const { port1,port2 } = new MessageChannel()

setTimeout(() => {
  port1.postMessage('port1发送的消息')
},3000);
port2.onmessage = ({ data }) => console.log('port2接受:',data)
port2.postMessage('port2发送的消息')
port1.onmessage = ({ data }) => console.log('port1接受:',data)
*/
//#endregion


async function test(url) {
  let res = await fetch(url)
  let reader = res.body.getReader()
  let filePath = path.join(__dirname,path.basename(url))
  let ws = createWriteStream(filePath)
  let { done,value } = await reader.read()
  while (!done) {
    // console.log(value)
    ws.write(value,err => err && console.log('写入错误：',err))
    let { done: done1,value: value1 } = await reader.read()
    done = done1
    value = value1
  }

  ws.end(() => console.log('写入完成'))

}

/**
 * 3 5 的倍数和
 * @param {number} number 
 * @returns 
 */
function multiplesOf3and5(number) {
  if (number < 3) return 0
  let res = 0,arr = []
  const is3and5Times = n => n > 2 && (!(n % 3) || !(n % 5))
  for (let i = 3; i < number; i++) {
    is3and5Times(i) && (res += i,arr.push(i))
  }
  return { res,arr };
}

// let res = multiplesOf3and5(1000);
// console.log('res',res)
/**
 * 前n项 fb 数列的偶数和
 * @param {number} n 
 */
function fiboEvenSum(n) {
  if (n < 3) return 2
  let a = 1,b = 2,c,res = 2
  while (a + b <= n) {
    c = a + b; a = b; b = c;
    c % 2 === 0 && (res += c)
  }
  return res;
}

// fiboEvenSum(1000)


function largestPrimeFactor(number) {
  // isPrime 判断是否质数
  const isPrime = num => {
    if (num < 2 || !Number.isSafeInteger(num)) return false
    for (let i = 2; i < num; i++) {
      if (num % i === 0) return false
    }
    return true
  }
  if (isPrime(number)) return number
  for (let i = number - 1; i >= 2; i--) {
    if (number % i === 0 && isPrime(i)) {
      return i
    }
  }

}

// let res = largestPrimeFactor(600851475143);
// console.log('res',res)

//能被从 1 到 n 的所有数整除的最小正数是多少？
function smallestMult(n) {
  const isAllDivide = (number,n) => {
    for (let i = 2; i <= n; i++) {
      if (number % i !== 0) return false
    }
    return true
  }
  let number = n
  while (true) {
    if (isAllDivide(number,n)) return number
    number++
  }
}

// console.log('smallestMult(5)',smallestMult(20))

function sumSquareDifference(n) {
  let a = 0,b = 0
  for (let i = 1; i <= n; i++) {
    a += i; b += i ** 2
  }
  a *= a
  console.log(a,b)
  return b - a;
}

// sumSquareDifference(10);

// 第n个 质数
function nthPrime(n) {
  const isPrime = num => {
    if (num < 2 || !Number.isSafeInteger(num)) return false
    for (let i = 2; i < num; i++) {
      if (num % i === 0) return false
    }
    return true
  }
  // i 循环的值 ;j 得到的质数的个数 ；k 最后一个质数
  for (let i = 2,j = 0,k = []; ; i++) {
    // if (j >= n) return k 
    if (i >= n) return k
    isPrime(i) && (j++,k.push(i))
  }

}

// console.log('nthPrime(100)',nthPrime(10001))

function largestProductinaSeries(n) {
  let arr = []
  for (let i = 0; i < thousandDigits.length - n; i++) {
    let groupArr = Array.from({ length: n },(_,j) => thousandDigits[i + j])
    arr.push(groupArr)
  }
  let resArr = arr.map(v => v.reduce((t,v) => t * v))

  let res = Math.max(...resArr)
  console.log('res',res)
  return res;
}

// largestProductinaSeries(13);
// a+b+c=n ,a ** 2 + b ** 2 === c ** 2, 求 a,b,c
function specialPythagoreanTriplet(n) {
  let sumOfabc = n;
  let resArr = []
  for (let a = 1; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      let c = sumOfabc - a - b
      if (c < b || c < a) break
      if (a ** 2 + b ** 2 === c ** 2) {
        resArr.push(a * b * c)
      }
    }
  }
  console.log('resArr',resArr)
  return resArr[0]
}

// specialPythagoreanTriplet(1000);
function primeSummation(n) {
  let arr = nthPrime(n)
  let res = arr.reduce((t,v) => t + v)
  console.log('res',res)
  return res;
}

// primeSummation(2000000);
// 求网络 路径 左上==>右下
function latticePaths(n) {
  let arr = []
  const fn = (x,y,path) => {
    if (x === n && y === n) return arr.push(path)
    if (x < n) fn(x + 1,y,path.concat([x,y]))
    if (y < n) fn(x,y + 1,path.concat([x,y]))
  }
  fn(0,0,[])
  return arr
}

// let res = latticePaths(4);
// console.log('res',res)


function longestCollatzSequence(limit) {
  const isEven = num => num % 2 === 0
  const _ = (n) => {
    let arr = [n]
    while (n !== 1) {
      n = isEven(n) ? n / 2 : 3 * n + 1
      arr.push(n)
    }
    return arr
  }
  let resArr = []
  for (let i = 1; i < limit; i++) {
    resArr.push([i,_(i).length])
  }
  let res = resArr.reduce((t,v,i) => {
    if (i === 0) return t = v
    return v[1] > t[1] ? v : t
  })
  return res[0]
}

// longestCollatzSequence(14);

function climbStairs(n) {
  const fb = (n,a,b) => {
    if (n <= 1) return b
    return fb(n - 1,b,a + b)
  }
  return fb(n,1,1)
  // if (n === 1) return 1
  // if (n === 2) return 2
  // return climbStairs(n - 1) + climbStairs(n - 2)
}

// console.log('climbStairs(3)',climbStairs(44))

function b(n,res) {
  "use strict"
  if (n === 0) return res
  return b(n - 1,res + n)
}
console.log('b(1000)',b(1000,0))
// debugger
