const { readFile,readdir,writeFile } = require('fs/promises')

// 生成主页项目链接
async function generateIndexPage(myPath) {
  const dirArr = await readdir(myPath)
  const reg = /^src\d/
  const reg2 = /(?<=<body>)(.|\n|\r)*?(?=<\/body>)/
  let res = dirArr.reduce((t,v) => reg.test(v) ? `${t}<h1><a href="./${v}">${v}</a></h1>\n` : t,'\n')
  let data = await readFile(myPath + 'index.html','utf-8')
  let newData = data.replace(reg2,res)
  await writeFile(myPath + 'index.html',newData)
  // console.log('写入完成')
}
generateIndexPage('./')