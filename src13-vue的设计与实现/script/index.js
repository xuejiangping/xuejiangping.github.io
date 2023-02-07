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



//#region 更加完善的响应式



class MyVue {

  bucket = new WeakMap() // 存储副作用的桶
  activeEffect = null //当前副作用函数
  activeEffectStack = [] // 活跃的副作用函数的栈，当嵌套effect调用时会存在多个activeEffect
  ITERATE = Symbol()     // for in 用于追踪的key
  TriggerType = { SET: 'SET',ADD: 'ADD',DELETE: 'DELETE' }
  //#region 渲染器
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
  //#endregion 

  //#region 响应式
  /** 任务 */
  jobPlan = {
    jobQueue: new Set(),  // 任务队列,set去重，相同任务执行一次
    p: Promise.resolve(), //创建promise实例，将job添加到微任务队列
    isFlushing: false,  //队列刷新状态
    /**
     * 该功能实现 连续多次修改响应式数据但只会触发一次更新（vue）
     */
    flushJob() {
      if (this.isFlushing) return
      this.isFlushing = true
      this.p.then(() => {
        this.jobQueue.forEach(job => job())
      }).finally(() => this.isFlushing = false)
    }
  }
  /**  
   * 副作用
   * @param {function} fn 副作用函数
   * @param {{lazy:boolean,dirty:boolean,sheduler:(effectFn:function)=>any}} options 配置项，如：调度器
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
      const res = fn()
      this.activeEffectStack.pop()
      this.activeEffect = this.activeEffectStack[this.activeEffectStack.length - 1]
      return res
    }
    effectFn.options = options
    effectFn.deps = []
    !options.lazy && effectFn()
    return effectFn
  }
  //跟踪副作用
  _track(target,key) {
    const { activeEffectStack,bucket } = this
    if (activeEffectStack.length === 0) return
    let depsMap = bucket.get(target)
    !depsMap && bucket.set(target,(depsMap = new Map()))
    let deps = depsMap.get(key)
    !deps && depsMap.set(key,(deps = new Set()))
    deps.add(this.activeEffect)
    //给当前activeEffect 收集依赖项deps，方便之后从key 的deps里删除activeEffect
    this.activeEffect.deps.push(deps)
  }
  //触发副作用
  _trigger(target,key,params) {
    const { oldValue,newValue,type } = params
    const values = { oldValue,newValue }
    let depsMap = this.bucket.get(target)
    if (!depsMap) return
    // 与key相关的副作用函数
    const effects = depsMap.get(key)
    //  创建集合effectsToRun,保存需要执行的副作用函数
    const effectsToRun = new Set()
    /** @callback cb  effectFn !== this.activeEffect：用于 确保将要执行的副作用函数不等于activeEffect，避免无限递归 */
    const cb = (effectFn) => effectFn !== this.activeEffect && effectsToRun.add(effectFn)
    effects && effects.forEach(cb)
    if (type === this.TriggerType.ADD || type === this.TriggerType.DELETE) {
      // 与ITERATE相关的副作用函数
      const itrateEffects = depsMap.get(this.ITERATE)
      itrateEffects && itrateEffects.forEach(cb)
    }
    effectsToRun.forEach(effectFn => {
      const sheduler = effectFn.options.sheduler
      if (sheduler) {
        sheduler(effectFn,values)
      } else effectFn()
    })
  }
  proxy(data) {
    const that = this
    return new Proxy(data,{
      // 拦截读取操作
      get(target,key,r) {
        // 添加副作用
        that._track(target,key)
        // 返回属性值
        return Reflect.get(target,key,r)
      },
      // 拦截设置操作
      set(target,key,newValue,r) {
        const oldValue = target[key]
        const type = Object.prototype.hasOwnProperty.call(target,key) ? that.TriggerType.SET : that.TriggerType.ADD
        // 设置属性值
        Reflect.set(target,key,newValue,r)
        const params = { oldValue,newValue,type }
        //触发副作用
        that._trigger(target,key,params)
        // 定义 Proxy 代理对象的 set 的时候，要返回 return true，特别是在严格模式下，否则，会报错
        return true
      },
      // 拦截 for in 
      ownKeys(t) {
        that._track(t,that.ITERATE)
        return Reflect.ownKeys(t)
      },
      //拦截 delete
      deleteProperty(t,k) {
        const hasKey = Object.prototype.hasOwnProperty.call(t,k)
        const res = Reflect.deleteProperty(t,k)
        if (res && hasKey) that._trigger(t,that.ITERATE,{ type: that.TriggerType.DELETE })
        return res
      }

    })
  }
  //#endregion

  //#region 计算属性
  /**
   * @param {()=>any} getter 
   */
  computed(getter) {
    /** dirty 为真时返回更新get，假时返回缓存变量 */
    let value,dirty = true,that = this
    const effctFn = this.effect(getter,{
      lazy: true,
      sheduler() {
        dirty = true
        that._trigger(obj,'value')
      }
    })
    const obj = {
      get value() {
        if (dirty) {
          value = effctFn()
          dirty = false
        }
        that._track(obj,'value')
        return value
      }
    }
    return obj
  }
  //#endregion

  //#region  watch实现
  /**
   * @param {{a:string}} obj 
   * @param {(oldValue,newValue,onInvalid:function)=>any} handler 
   */
  watch(source,handler,options = {}) {
    let oldValue,newValue
    // 递归source,
    const traverse = (value,seen = new Set()) => {
      if (typeof value !== 'object' || value === null || seen.has(value)) return
      seen.add(value)
      for (const key in value) {
        traverse(value[key],seen)
      }
      return value
    }
    // cleanup 用来存储用户注册的过期回调
    let cleanup
    const onInvalid = (fn) => cleanup = fn
    const getter = typeof source === 'function' ? source : () => traverse(source)
    const effctFn = this.effect(getter,{
      sheduler(_,{ oldValue,newValue }) {
        if (cleanup) cleanup()
        handler(oldValue,newValue,onInvalid)
      },
      lazy: true
    })
    oldValue = effctFn()
    if (options.immediate) {
      handler(oldValue,newValue,onInvalid)
    }
  }
  //#endregion


}

const data1 = { name: 'a',age: 12,}
const data2 = { title: 'MyVue',n: 1,m: 0 }
const data3 = { a: 1,b: 2,c: { d: 3 } }
const myVue = new MyVue()

const obj1 = myVue.proxy(data1)
const obj2 = myVue.proxy(data2)
const obj3 = myVue.proxy(data3)
// 测试计算属性
let sumRes = myVue.computed(() => obj2.m + obj2.n)

myVue.watch(obj3,(oldVal,newVal,onInvalid) => {
  let expired = false
  onInvalid(() => expired = true)
  if (!expired) console.log(123)
},{ immediate: false })

window.test = { obj1,obj2,obj3,sumRes,myVue }
/**  更新Node  */
const App = () => h('div',{ id: 'app' },[
  h('div',{ style: 'color:red;font-size:50px' },obj2.title),
  h('button',{ onClick: () => alert(new Date) },'显示时间'),
  h(ComponentA),
  h(ComponentB),
  h('h1',null,'name:' + obj1.name),
  h('h1',null,'age:' + obj1.age),
  h('h1',null,'测试计算属性sumRes:' + sumRes.value),

])
myVue.effect(() => {
  myVue.renderer(App,document.body)
})
// 测试 副作用函数fn放入微队列,多次修改响应式数据，只执行最终结果
myVue.effect(() => obj2.n,{
  sheduler(fn) {
    myVue.jobPlan.jobQueue.add(fn)
    myVue.jobPlan.flushJob()
  }
})
// 测试for in 
myVue.effect(() => {
  for (let k in obj2) {
    console.log('k',k)
  }
})
//#endregion
delete obj2.n