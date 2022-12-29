const { Worker,isMainThread } = require('node:worker_threads');
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



