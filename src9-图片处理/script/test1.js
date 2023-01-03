const { readFile,readdir,stat,writeFile } = require('fs/promises')
const path = require('path')
let reg = /(?<=<title>).*?(?=<\/title>)/
let text = '浮生浪迹笑明月'
/**
 * 修改目录中所的文件
 * @param {*} myPath 
 * @returns 
 */

async function main(myPath,target,searchValue,replaceValue) {
  let dir = await readdir(myPath)
  if (dir.length < 1) return
  dir.forEach(async (v) => {
    if (v === 'node_modules') return
    let currentPath = path.join(myPath,v)
    let stats = await stat(currentPath)
    if (stats.isFile() && v === target) {
      let data = await readFile(currentPath,{ encoding: 'utf-8' })
      data = data.replace(searchValue,replaceValue)
      await writeFile(currentPath,data)
      console.log(`修改完成 => ${replaceValue}`,currentPath)
    } else if (stats.isDirectory()) {
      main(currentPath,target,searchValue,replaceValue)
    }

  })

}
// readdir('./').then(console.log)
main('./','index.html',reg,text)
// debugger