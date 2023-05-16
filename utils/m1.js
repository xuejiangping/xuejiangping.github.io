(function (root,factory) {
  console.log('没有模块环境，直接挂载在全局对象上')
  root.umdModule = factory();
}(this,function () {
  return {
    hello() {
      alert('你好')
    }
  }
}))