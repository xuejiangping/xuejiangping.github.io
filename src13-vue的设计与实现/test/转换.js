const babel = require("@babel/core");
const fs = require('fs')
const path = require('path')
let { code } = babel.transformFileSync('src13-vue的设计与实现/test/test1.jsx',{
  presets: ["@babel/preset-react"]
})
code = code.replaceAll('React.createElement','h')
fs.writeFileSync(path.join(__dirname,'./test2.js'),code)
// console.log('res',code)

// debugger