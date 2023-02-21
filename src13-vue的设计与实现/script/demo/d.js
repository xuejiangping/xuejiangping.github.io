// const babel = require("@babel/core");
import babel from '@babel/core'
let res = babel.transformFileSync('src13-vue的设计与实现/script/demo/c.jsx',{
  presets: ["@babel/preset-react"]
}).code

console.log('res',res)

debugger