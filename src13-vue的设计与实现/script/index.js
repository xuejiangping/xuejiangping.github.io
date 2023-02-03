//#region vue 渲染器  

const template = `
<div id="app">
  <span class="foo" :id="123" style="color:red">999</span>
</div>
`
const ComponentA = {
  render() {
    return h('h1',{ onClick: (e) => console.log(e) },'我是ComponentA')
  }
}
const ComponentB = function () {
  return h('h1',null,'我是ComponentB')
}

/**
* 生成vNode函数 
*/
function h(tag,props,children) {
  return {
    tag,props,children
  }
}



//#endregion

//#region 响应式系统

// function test1() {
//   // 存储副作用的桶
//   const bucket = new Set()
//   // 原始数据
//   const data = { name: 'a' }
//   const obj = window.obj = new Proxy(data,{
//     get(target,key) {
//       bucket.add(effect)
//       return target[key]
//     },
//     set(target,key,newVal) {
//       target[key] = newVal
//       bucket.forEach(fn => fn())
//       return true
//     }
//   })
//   function effect() {
//     app.appendChild(document.createTextNode(obj.text))
//   }
//   effect()
// }
// /**
//  *
//  * @param {object} data
//  * @param {WeakMap} bucket
//  * @returns
//  */
// function proxy(data,bucket) {
//   const _track = (target,key,activeEffect) => {
//     if (!activeEffect) return
//     let depsMap = bucket.get(target)
//     if (!depsMap) {
//       bucket.set(target,(desMap = new Map()))
//     }
//     let deps = depsMap.get(key)
//     if (!deps) depsMap.set(key,(deps = new Set()))
//     deps.add(activeEffect)
//   }
//   const _trigger = (target,key) => {
//     let depsMap = bucket.get(target)
//     if (!depsMap) return
//     let effects = depsMap.get(key)
//     effects && effects.forEach(effect => effect())
//   }

//   return new Proxy(data,{
//     // 拦截读取操作
//     get(target,key) {
//       // 添加副作用
//       _track(target,key)
//       // 返回属性值
//       return target[key]
//     },
//     // 拦截设置操作
//     set(target,key,newVal) {
//       // 设置属性值
//       target[key] = newVal
//       //触发副作用
//       _trigger(target,key)
//     }
//   })
// }



//#endregion

//#region 更加完善的响应式



class MyVue {

  bucket = new WeakMap() // 存储副作用的桶
  activeEffect = null //当前副作用函数
  activeEffectStack = [] // 活跃的副作用函数的栈，当嵌套effect调用时会存在多个activeEffect
  jobQueue = new Set()  // 任务队列
  flushJob = (() => {
    const p = Promise.resolve()  //创建promise实例，将job添加到微任务队列
    let isFlushing = false    //队列刷新状态
    return () => {
      if (isFlushing) return
      isFlushing = true
      p.then(() => {
        this.jobQueue.forEach(job => job())
      }).finally(() => isFlushing = false)
    }
  })()

  /**
   * 渲染器
   * @param {vNode} vNode 
   * @param {HTMLElement} root
   */
  renderer(vNode,root) {
    if (typeof vNode === 'function') vNode = vNode()
    const { tag } = vNode
    if (typeof tag === 'string') {
      this.mountElement(vNode,root)
    } else this.mountComponent(vNode,root)
  }


  /**
   * 挂载元素
   * @param {vNode} vNode 
   * @param {*} container 
   */
  mountElement(vNode,container) {
    const { tag,children,props } = vNode
    const el = document.createElement(tag)
    for (const key in props) {
      if (key.startsWith('on')) {
        const eventName = key.substring(2).toLowerCase()
        el.addEventListener(eventName,props[key])
      } else el.setAttribute(key,props[key])
    }
    if (typeof children === 'string') {
      el.appendChild(document.createTextNode(children))
    } else if (Array.isArray(children)) {
      children.forEach(child => this.renderer(child,el))
    }
    container.appendChild(el)
  }
  /**
   * 挂载组件
   * @param {vNode} vNode 
   * @param {HTMLElement} container 
   */
  mountComponent(vNode,container) {
    const { tag } = vNode
    let subTree
    if (typeof tag === 'function') { // 函数组件
      subTree = tag()
    } else if (typeof tag === 'object') { //类式组件
      subTree = tag.render()
    }
    this.renderer(subTree,container)
  }
  /**
   * 副作用函数
   * @param {function} fn 
   * @param {object} options 配置项，如：调度器
   */
  effect(fn,options = {}) {
    /**
     * 清除副作用函数的依赖项
     * @param {effectFn} effectFn 
     */
    const cleanup = (effectFn) => {
      effectFn.deps.forEach(item => item.delete(effectFn))
      effectFn.deps.length = 0
    }
    // 包装副作用函数
    const effectFn = () => {
      cleanup(effectFn)
      this.activeEffect = effectFn
      this.activeEffectStack.push(effectFn)
      fn()
      this.activeEffectStack.pop()
      this.activeEffect = this.activeEffectStack[this.activeEffectStack.length - 1]
    }
    effectFn.options = options
    effectFn.deps = []
    effectFn()
  }

  proxy(data) {
    //跟踪副作用
    const _track = (target,key) => {
      const { activeEffectStack,bucket } = this
      if (activeEffectStack.length === 0) return
      let depsMap = bucket.get(target)
      !depsMap && bucket.set(target,(depsMap = new Map()))
      let deps = depsMap.get(key)
      if (!deps) depsMap.set(key,(deps = new Set()))
      deps.add(this.activeEffect)
      //给当前activeEffect 收集依赖项deps，方便之后从key 的deps里删除activeEffect
      this.activeEffect.deps.push(deps)
    }
    //触发副作用
    const _trigger = (target,key) => {
      let depsMap = this.bucket.get(target)
      if (!depsMap) return
      const effects = depsMap.get(key)
      if (!effects) return
      /**
       *  复制effects集合,因为副作用函数调用时 会触发_track ,导致effects的长度一直变化；
       *  这会致死循环，所以须创建effects的副本，这里：effectsToRun,来调用副作用函数
       */
      const effectsToRun = new Set()
      //如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      effects.forEach(effectFn => effectFn !== this.activeEffect && effectsToRun.add(effectFn))
      effectsToRun.forEach(effectFn => {
        const sheduler = effectFn.options.sheduler
        if (sheduler) {
          sheduler(effectFn)
        } else effectFn()
      })
    }

    return new Proxy(data,{
      // 拦截读取操作
      get(target,key) {
        // 添加副作用
        _track(target,key)
        // 返回属性值
        return target[key]
      },
      // 拦截设置操作
      set(target,key,newVal) {
        // 设置属性值
        target[key] = newVal
        //触发副作用
        _trigger(target,key)
        // 定义 Proxy 代理对象的 set 的时候，要返回 return true，特别是在严格模式下，否则，会报错
        return true
      }
    })
  }



}

const data1 = { name: 'a',age: 12 }
const data2 = { title: 'MyVue',n: 1,m: 0 }
const myVue = window.myVue = new MyVue()
const obj1 = myVue.proxy(data1)
const obj2 = myVue.proxy(data2)
console.log(obj1,obj2)
/**  更新Node  */
const App = () => h('div',{ id: 'app' },[
  h('div',{ style: 'color:red;font-size:50px' },obj2.title),
  h('button',{ onClick: () => alert(new Date) },'显示时间'),
  h(ComponentA),
  h(ComponentB),
  h('h1',null,'name:' + obj1.name),
  h('h1',null,'age:' + obj1.age),
])

myVue.effect(() => myVue.renderer(App,document.body))

myVue.effect(() => console.log('n',obj2.n),{
  sheduler(fn) {
    myVue.jobQueue.add(fn)
    myVue.flushJob()
    // 比如：将副作用函数 放入微队列，控制将副作用函数执行时间
    // Promise.resolve().then(fn)
  }
})

myVue.effect(() => console.log('m',obj2.m),{
  sheduler(fn) {
    myVue.jobQueue.add(fn)
    myVue.flushJob()
    // 比如：将副作用函数 放入微队列，控制将副作用函数执行时间
    // Promise.resolve().then(fn)
  }
})
Array(9).fill().forEach(() => { obj2.n++; obj2.m++ })
console.log('结束了')
//#endregion

