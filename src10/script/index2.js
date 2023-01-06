const { execSync,execFile } = require('child_process')
const { readFile } = require('fs/promises')
const path = require('path')
// readFile(path.join(__dirname,'../assets/testText.txt'),'utf-8')
//   .then(setLetterMap).then(setHistogram)

function setLetterMap(txt) {
  const resMap = new Map()
  const reg = /[A-Z]/
  for (let i = 0; i < txt.length; i++) {
    const item = txt[i].toUpperCase()
    if (!reg.test(item)) continue
    if (resMap.has(item)) {
      resMap.get(item).count++
    } else {
      resMap.set(item,{ count: 1 })
    }
  }
  return resMap
}
/**
 * 
 * @param {Map} charMap 
 */
function setHistogram(charMap) {
  let total = [...charMap].reduce((t,v) => t + v[1].count,0)
  let res = ''
  charMap.forEach((v,k) => {
    res += formatInput(k,v.count / total * 100) + '\n'
  })
  console.log(res)
  return res
}

function formatInput(key,p) {
  let b = '#'.repeat(p)
  return `${key}: ${b} ${p.toFixed(2)}%`
}


// let res = execSync(' node ./index.js',{ encoding: 'utf-8' })
// console.log('res',res)

// debugger