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





/**
 * 自己实现的 Vue
 * @class 
 */
class MyVue {
  /**@type { WeakMap < object,Map < string | symbol,Set < function>>>} */
  bucket = new WeakMap() // 存储副作用的桶

  activeEffect = null //当前副作用函数
  activeEffectStack = [] // 活跃的副作用函数的栈，当嵌套effect调用时会存在多个activeEffect
  ITERATE = Symbol('ITERATE')     // for in 用于追踪的key
  TriggerType = { SET: 'SET',ADD: 'ADD',DELETE: 'DELETE' }
  myLog(label,...res) {
    console.log(`${label} ==>`,...res)
    // console.table({ [label]: res })
  }
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
  /** 微任务 */
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
   * @param {{lazy:boolean,dirty:boolean,sheduler:function}} options 配置项，如：调度器
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
    const { activeEffectStack,bucket,activeEffect } = this
    if (activeEffectStack.length === 0) return
    let depsMap = bucket.get(target)
    !depsMap && bucket.set(target,(depsMap = new Map()))
    let deps = depsMap.get(key)
    !deps && depsMap.set(key,(deps = new Set()))
    deps.add(activeEffect)
    //给当前activeEffect 收集依赖项deps，方便之后从key 的deps里删除activeEffect
    activeEffect.deps.push(deps)
  }
  //触发副作用
  _trigger(target,key,params) {
    const { oldVal,newVal,type } = params
    const values = { oldVal,newVal }
    const depsMap = this.bucket.get(target)
    if (!depsMap) return
    // 与key相关的副作用函数
    const effects = depsMap.get(key)
    //  创建集合effectsToRun,保存需要执行的副作用函数
    const effectsToRun = new Set()
    /** @callback cb  effectFn !== this.activeEffect：用于 确保将要执行的副作用函数不等于activeEffect，避免无限递归 */
    const cb = (effectFn) => effectFn !== this.activeEffect && effectsToRun.add(effectFn)
    effects && effects.forEach(cb)
    // 和迭代相关的副作用 itrateEffects
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
  /**
   * @typedef {{isShallow?: boolean,isReadonly?:boolean}} reactiveOptions
   */
  /**
   * @param  data 需要代理的原始数据
   * @param {reactiveOptions} options 
   * isShallow:深度响应 
   * isReadonly: 只读属性
   */
  reactive(data,options = { isShallow: false }) {
    const _this = this
    const { isShallow,isReadonly } = options
    return new Proxy(data,{
      // 拦截读取操作
      get(target,key,r) {
        if (key === 'raw') return target
        // 添加副作用
        !isReadonly && _this._track(target,key)
        const res = Reflect.get(target,key,r)
        // 判断 res 类型，实现 深度响应
        return !isShallow && typeof res === 'object' && res !== null
          ? _this.reactive(res,options) : res
      },
      // 拦截设置操作
      set(target,key,newVal,r) {
        if (key === 'd') console.log('d',target)
        const oldVal = target[key]
        const type = Object.prototype.hasOwnProperty.call(target,key) ? _this.TriggerType.SET : _this.TriggerType.ADD
        if (isReadonly) return console.warn(`属性${key}为只读属性`)
        // 设置属性值
        const res = Reflect.set(target,key,newVal)
        // 为真时，才执行 triggle，屏蔽由原型引起的更新，避免不必要的更新操作。
        if (r.raw === target) {

          // 确保 新值!==旧值 且不能同为NAN
          if (oldVal !== newVal && oldVal === oldVal) {
            const params = { oldVal,newVal,type }
            _this._trigger(target,key,params)
          }
        }

        // 定义 Proxy 代理对象的 set 的时候，要返回 return true，特别是在严格模式下，否则，会报错
        return res
      },
      // 拦截 for in 
      ownKeys(t) {
        _this._track(t,_this.ITERATE)
        return Reflect.ownKeys(t)
      },
      //拦截 delete,会触发for in 相关的副作用
      deleteProperty(t,k) {
        if (isReadonly) return console.warn(`属性${k}为只读属性`)
        const hasKey = Object.prototype.hasOwnProperty.call(t,k)
        const res = Reflect.deleteProperty(t,k)
        if (res && hasKey) _this._trigger(t,_this.ITERATE,{ type: _this.TriggerType.DELETE })
        return res
      }

    })
  }
  // 浅响应
  shallowReactive(data,options) {
    return this.reactive(data,{ isShallow: true,...options })
  }
  //#endregion

  //#region 计算属性
  /**
   * @param {()=>any} getter 
   */
  computed(getter) {
    /** dirty 为真时返回更新get，假时返回缓存变量 */
    let value,dirty = true,_this = this
    const effctFn = this.effect(getter,{
      lazy: true,
      sheduler() {
        dirty = true
        _this._trigger(obj,'value')
      }
    })
    const obj = {
      get value() {
        if (dirty) {
          value = effctFn()
          dirty = false
        }
        _this._track(obj,'value')
        return value
      }
    }
    return obj
  }
  //#endregion

  //#region  watch实现

  watch(source,handler,options = {}) {
    let oldVal,newVal
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
      sheduler(_,{ oldVal,newVal }) {
        if (cleanup) cleanup()
        handler(oldVal,newVal,onInvalid)
      },
      lazy: true
    })
    oldVal = effctFn()
    if (options.immediate) {
      handler(oldVal,newVal,onInvalid)
    }
  }
  //#endregion


}

const myVue = new MyVue()
//#region 原始数据
const rawData = {
  obj1: { name: 'a',age: 12,},
  obj2: { title: 'MyVue',n: 1,m: 0,o: 3 },
  obj3: { a: 1,b: 2,c: { d: 3 } },
  obj4: { e: { f: 'f' } },
  arr1: [{ a: 1 },2]
}
//#endregion

//#region reactive数据
const reactiveData = {
  obj1: myVue.reactive(rawData.obj1),
  obj2: myVue.reactive(rawData.obj2),
  obj3: myVue.reactive(rawData.obj3,{ isReadonly: true }),
  obj4: myVue.shallowReactive(rawData.obj4,{ isReadonly: true }),
  arr1: myVue.reactive(rawData.arr1)
}
//#endregion

window.test = { rawData,reactiveData,myVue }

//#region  测试各项功能
// 测试 计算属性
let sumRes = myVue.computed(() => reactiveData.obj2.m + reactiveData.obj2.n)

// 测试 watch 和 任务时效
myVue.watch(reactiveData.obj3,(oldVal,newVal,onInvalid) => {
  let expired = false
  onInvalid(() => expired = true)
  // await 耗时异步任务(),若在等待期间副作用函数再次执行，开始新的异步任务
  // () => expired = true 会执行，导致不会继续执行
  if (expired) return
  // 若任务没有过期，继续执行下面代码
  // console.log('watch 和 任务时效')
  myVue.myLog('watch 和 任务时效')
},{ immediate: false })


/**  更新Node  */
const App = () => h('div',{ id: 'app' },[
  h('div',{ style: 'color:red;font-size:50px' },reactiveData.obj2.title),
  h('button',{ onClick: () => alert(new Date) },'显示时间'),
  h(ComponentA),
  h(ComponentB),
  h('h1',null,'name:' + reactiveData.obj1.name),
  h('h1',null,'age:' + reactiveData.obj1.age),
  h('h1',null,'测试计算属性sumRes:' + sumRes.value),

])

// 测试 响应式 renderer 渲染器
myVue.effect(() => {
  myVue.renderer(App,document.body)
})
// 测试 副作用函数fn放入微队列,多次修改响应式数据，只执行最终结果
myVue.effect(() => reactiveData.obj2.n,{
  sheduler(fn) {
    myVue.jobPlan.jobQueue.add(fn)
    myVue.jobPlan.flushJob()
  }
})
// 测试 for in 
myVue.effect(() => {
  for (let k in reactiveData.obj2) {
    // console.log('测试 for in ==>',k)
  }
})
// delete reactiveData.obj2.n

// 测试 避免因原型引起的不必要的更新
Object.setPrototypeOf(rawData.obj1,rawData.obj2)
myVue.effect(() => myVue.myLog('避免因原型引起的不必要的更新',reactiveData.obj1.o))

// 测试 深响应
myVue.effect(() => {
  myVue.myLog('深响应',reactiveData.obj3.c.d)
})
// reactiveData.obj3.c.d = 4

//测试 浅响应
myVue.effect(() => {
  myVue.myLog('浅响应',reactiveData.obj4.e.f)
})
// reactiveData.obj3.e = { f: '88' }
//测试 数组
myVue.effect(() => myVue.myLog('测试 数组',reactiveData.arr1.length))
reactiveData.arr1[2] = 3
//#endregion

