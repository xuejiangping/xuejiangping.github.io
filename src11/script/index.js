/**
 * 生成虚拟Dom
 * @param {Node} rootNode 
 */
function createVirtualDom(rootNode) {
  let { nodeType,nodeValue,childNodes,nodeName,attributes } = rootNode
  const data = {
    nodeType,
    tag: nodeName.toLowerCase(),
    value: null,
    children: [],
    attrs: null
  }
  if (attributes?.length > 0) {
    data.attrs = [...attributes].reduce((t,{ nodeName,nodeValue }) => (!!nodeValue.trim() && (t[nodeName] = nodeValue),t),{})
  }
  if (nodeType === rootNode.ELEMENT_NODE) {
    let { length } = childNodes
    if (length > 0) data.children = [...childNodes].map(v => createVirtualDom(v))
  } else {
    data.value = nodeValue
  }
  return data
}


/**
 * 根据虚拟dom 生成真实dom
 * @param {*} vNode 
 * @returns 
 */
function createPageByVirtualDom(vNode) {
  // const fg = document.createDocumentFragment()
  const { children,tag,value,attrs,nodeType } = vNode
  const attrsValue = attrs ? Object.entries(attrs).reduce((t,[k,v]) => t + ` ${k}="${v}"`,'') : ''
  const innerValue = value || children.reduce((t,v) => t + createPageByVirtualDom(v),'')
  const html = nodeType === Node.ELEMENT_NODE ? `<${tag}${attrsValue}>${innerValue}</${tag}>` : value
  return html
}



class ListNode {
  constructor(val,next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
  }
}
/**
 * 利用 数组 生成新链表 返回 新链表 根节点
 * 普通循环版
 * @param {[]} arr 
 */
let createListByArray = (arr) => {
  return arr.reduce((t,v,i) => {
    let node = new ListNode(typeof v === 'string' ? +v : v)
    if (i === 0) {
      t.root = t.lastNode = node
    } else {
      t.lastNode.next = node
      t.lastNode = node
    }
    return t
  },{})
}
/**
 * 递归版
 * @param {[]} arr 
 * @returns 
 */
let createListByArray2 = (arr) => {
  if (arr.length < 1) return null
  return new ListNode(arr.shift(),createListByArray2(arr))
}


/**
 * 
 * @param {ListNode} l1 
 * @param {ListNode} l2 
 * @param {number} a 
 */
function addTwoNumbers(l1,l2,a = 0) {
  if (l1 === null && l2 === null) { return a === 0 ? null : new ListNode(a) }
  l1 !== null && (a += l1.val,l1 = l1.next)
  l2 !== null && (a += l2.val,l2 = l2.next)
  return new ListNode(a % 10,addTwoNumbers(l1,l2,Math.floor(a / 10)))
}

// let res = addTwoNumbers(createListByArray2([2,4,3]),createListByArray2([5,6,4]))
// console.log('res',res)

/**
 * 
 * @param {string} s 
 */
function lengthOfLongestSubstring(s) {
  let { length } = s
  let arr = []
  let maxLen = 0
  for (let i = 0; i < length;) {

    arr.includes(s[i]) ? arr.shift()
      : (arr.push(s[i++]),maxLen = Math.max(arr.length,maxLen))
  }
  console.log('maxLen',maxLen,arr)
  return maxLen
}

// lengthOfLongestSubstring('pwwkew')
// lengthOfLongestSubstring('abcabcbb')
// lengthOfLongestSubstring(' ')


/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s,numRows) {
  let { length } = s
  if (numRows === 1) return s
  debugger
  let arr = Array(numRows).fill('')
  for (let i = 0,currentRow = 0,step = 1; i < length; i++,currentRow += step) {
    arr[currentRow] += s[i];
    i > 0 && i % (numRows - 1) == 0 && (step = -step)
  }
  return arr.reduce((t,v) => t + v)
};
// console.log("convert('PAYPALISHIRING',4)",convert('AB',1))


var reverse = function (x) {
  let n = 0
  debugger
  let getInt = x > 0 ? Math.floor : Math.ceil
  while (x) {
    n = n * 10 + x % 10
    x = getInt(x)
  }
  console.log('n',n)
  // return n
};


/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums,target) {
  let arr = nums.sort((a,b) => a - b)
  debugger
  if (target > 0) {
    let index = arr.findIndex(v => v > target)
    if (index === -1) index = arr.length - 1

    return arr[index] + arr[index - 1] + arr[index - 2]
  } else {
    let index = arr.findIndex(v => v > target)
    if (index === -1) index = 0
    return arr[index] + arr[index + 1] + arr[index + 2]
  }

};

// let res = threeSumClosest([4,0,5,-5,3,3,0,-4,-5],- 2)
/**
 * @param {string} s
 * @return {number}
 */
var myAtoi = s => {
  let a = s.trimStart().match(/^-?(0x|0b|0o)?\d+/i)
  return Number(a)
}
/**
 * 
 * @param {[]} height 
 */
var maxArea = function (height) {
  let getArea = (x,y) => x * y
  let { length } = height
  // debugger
  let newHeight = height.slice()
  let y1 = Math.max(...newHeight)  //最长的柱子
  let index1 = height.indexOf(y1)
  newHeight.splice(index1,1)
  let y2 = Math.max(...newHeight) //第二长的柱子
  let index2 = height.indexOf(y2,index1 + 1)
  if (index2 === -1) index2 = height.indexOf(y2,index1 - 1)
  let s1 = getArea(Math.abs(index1 - index2),y2)
  let index3 = length - 1
  let x = Math.max(index1,index3 - index1) //离 最高的柱子 最远的柱子 距离 
  let s2 = getArea(x,height[index3])
  console.log(s1,s2)
  return Math.max(s1,s2)
};
// maxArea([1,8,6,2,5,4,8,3,7])
// maxArea([1,1])

/**
 * 缓存函数
 * @param {function} fn 
 */
let memorize = (fn) => {
  let _fn = fn
  return function (...args) {
    _fn.cache = _fn.cache || {}
    return _fn.cache[args] ?? (_fn.cache[args] = _fn(...args))
  }
}

// const log = memorize((a) => (console.log(a),new Date().toLocaleString()))
// console.log('log(123)',log(123))

var reinitializePermutation = function (n) {
  let perm = Array(n).fill().map((_,i) => i)
  let originPerm = perm.slice()
  let arr = []
  let isSameArr = (arr1,arr2) => {
    if (arr1.length !== arr2.length) return false

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false
    }
    return true
  }
  for (let j = 1; ; j++) {
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) arr[i] = perm[i / 2]
      else arr[i] = perm[n / 2 + (i - 1) / 2]
      if (isSameArr(arr,originPerm)) return console.log('结果',j)
    }
    perm = arr.slice()
  }
};
// reinitializePermutation(10)

var intToRoman = function (num) {
  let values = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  let keys = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]
  const findClosestIndex = (num) => values.findIndex(v => v <= num)
  let res = ''
  const _fn = (num) => {
    if (num === 0) return
    let i = findClosestIndex(num)
    res += keys[i]
    _fn(num - values[i])
  }
  _fn(num)
  return res

}
// let res = intToRoman(3)
/**
 * 
 * @param {string} s 
 * @returns 
 */
var romanToInt = function (s) {
  let values = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  let keys = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]
  let res = 0
  while (s.length > 0) {
    for (let i = 0; i < 13; i++) {
      let k = keys[i]
      if (s.startsWith(k)) {
        let index = keys.indexOf(k)
        res += values[index]
        s = s.replace(k,'')
      }
    }
  }

  console.log('res',res)
  return res
};

// romanToInt('MCMXCIV')

/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  let { length: n } = nums
  let arr = []
  // 判断两数组是否不同
  let isDiffArr = (arr1,arr2) => arr1.some(v => !arr2.includes(v)) || arr2.some(v => !arr1.includes(v))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        // console.log(i,j,k)
        let temp = [x,y,z] = [nums[i],nums[j],nums[k]]
        if (x + y + z === 0) {
          // console.log(temp)
          if (arr.every(v => isDiffArr(v,temp))) {
            arr.push(temp)
          }
        }
      }
    }
  }
  console.log(arr)
  debugger
};
// threeSum([0,3,0,1,1,-1,-5,-5,3,-3,-3,0])

/**
 * 画星星
 * @param {number} rows 行数
 * @param {string} p 图章样式
 */
const printPattern = (rows,p = '🎄') => {
  let halfRows = Math.floor(rows / 2)
  let res = ''
  for (let i = 0,k = 1; i < rows; i++) {
    // v:每行前面的空格数：(rows - k) / 2, k:改行的图章数
    /**
     * @variation 1213  
     * @variation k
     */
    let v = '  '.repeat((rows - k) / 2)
    for (let j = 0; j < k; j++) v += p
    res += v + '\n'  // 将每行结果进行拼接并添加换行符 
    i < halfRows && (k += 2) || (k -= 2)
  }
  console.log(res)
}
// printPattern(19)

function a() {
  let cancelBtn = document.querySelector('.Scroll_wrap_ObsGW').querySelectorAll('button');
  let arr = Array.from(cancelBtn).filter(v => v.querySelector('.woo-button-content').textContent.trim() == '已关注')
  if (arr.length < 1) return alert('结束')
  arr.forEach((v,i,array) => {
    setTimeout(() => {
      v.click()
      setTimeout(() => {
        let submitBtn = document.querySelector('.woo-modal-main').querySelectorAll('button')[1]
        submitBtn.click()
        if (i === array.length - 1) {
          window.scrollBy(0,1500)
          setTimeout(a,2000)
        }
      },400);
    },1000 * i);
  })

}








// debugger