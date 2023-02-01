const { readFile,readdir,writeFile } = require('fs/promises')

// 生成主页项目链接
async function generateIndexPage(myPath) {
  const reg = /^src(\d+)/
  const reg2 = /(?<=<body>)(.|\n|\r)*?(?=<\/body>)/
  const dirArr = (await readdir(myPath)).filter(d => reg.test(d)).sort((a,b) => a.match(reg)[1] - b.match(reg)[1])
  let res = dirArr.reduce((t,v) => `${t}<h1><a href="./${v}">${v}</a></h1>\n`,'\n')
  let data = await readFile(myPath + 'index.html','utf-8')
  let newData = data.replace(reg2,res)
  await writeFile(myPath + 'index.html',newData)
  console.log('写入完成')
}
generateIndexPage('./')
