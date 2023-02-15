
/**
 * 实现 响应式
 */
class Reactivity {
  /**@type { WeakMap < object,Map < string | symbol,Set < function>>>} */
  bucket = new WeakMap() // 存储副作用的桶
  activeEffect = null //当前副作用函数
  activeEffectStack = [] // 活跃的副作用函数的栈，当嵌套effect调用时会存在多个activeEffect
  ITERATE = Symbol('ITERATE')     // for in 用于追踪的key
  ITERATE_KEY_SET_MAP = Symbol('ITERATE_KEY_SET_MAP')  // 追踪 set集合中 size变化
  RAW_KEY = Symbol('RAW_KEY')
  TRIGGER_TYPE = { SET: 'SET',ADD: 'ADD',DELETE: 'DELETE' }  // 触发set 的类型 
  reactiveMap = new Map()    // 存储 原始数据到代理数据的映射
  _shouldTrack = true   //代表是否运行 track ()追踪
  log(label,...res) {
    console.log(`${label} ==>`,...res)
    // console.table({ [label]: res })
  }


  //#region 重写 array,set,map 部分方法

  // 数组方法
  ArrayInstrmentations = ((arrMethods,_this) => {
    const group1 = ['indexOf','lastIndexOf'] //index相关
    const group2 = ['includes']         //
    const group3 = ['push','pop','shift','unshift','splice']  //和数组length 相关
    const match = (group,method) => group.includes(method)
    const { RAW_KEY,_shouldTrack } = _this
    return arrMethods.reduce((res,method) => {
      res[method] = function (...args) {  // this 指向原始数据
        let val,originMethod = Array.prototype[method],t = this[RAW_KEY]
        if (match(group1,method)) {
          val = originMethod.apply(this,args)
          val < 0 && (val = originMethod.apply(t,args))
        } else if (match(group2,method)) {
          val = originMethod.apply(this,args)
          val === false && (val = originMethod.apply(t,args))
        } else if (match(group3,method)) {
          _shouldTrack = false
          val = originMethod.apply(t,args)
          _shouldTrack = true
        }
        return val
      }
      return res
    },{})
  }

  )(['includes','indexOf','lastIndexOf','push','pop','shift','unshift','splice'],this)
  // Set和Map方法
  MutableInstrumentations = ((methods,_this) => {
    const { ITERATE_KEY_SET_MAP,RAW_KEY,TRIGGER_TYPE: { ADD,SET } } = _this

    return methods.reduce((res,method) => {
      res[method] = function (...args) {
        let val,k = args[0],newVal = args[1],t = this[RAW_KEY],hasKey = t.has(k)
        switch (method) {
          case 'get':
            if (hasKey) {
              _this._track(t,k)
              val = _this.wrap(t.get(k))
            }
            break;
          case 'set':
            const oldVal = t.get(k)
            // 避免污染源数据，源数据 target 上不能是响应式数据，所以:newVal[_this.RAW_KEY] || newVal 
            if (hasKey) {
              if (oldVal !== newVal && newVal === newVal) {
                val = t.set(k,newVal[RAW_KEY] || newVal)
                _this._trigger(t,k,{ newVal,type: SET })
                _this._trigger(t,ITERATE_KEY_SET_MAP,{ newVal,type: ADD })
              }
            } else {
              val = t.set(k,newVal[RAW_KEY] || newVal)
              _this._trigger(t,ITERATE_KEY_SET_MAP,{ newVal,type: ADD })
            }
            break;
          case 'forEach':
            const cb = args[0]
            val = t[method](...args)
            t.forEach((v,...args) => cb(_this.wrap(v),...args))
            _this._track(t,ITERATE_KEY_SET_MAP)
            break;
          case Symbol.iterator: // 可迭代协议：对象实现了 Symbol.iterator 方法
            const itr = t[method]() //map的原始迭代器
            _this._track(t,ITERATE_KEY_SET_MAP)
            val = {  // 新的迭代器
              next() {  // 迭代器协议：对象中实现了next方法
                const { value,done } = itr.next()
                return { value: value?.map(v => _this.wrap(v)),done }
              },
              [Symbol.iterator]: this
            }
            break;

          default:
            val = t[method](...args)  // t 会指向set本身，非代理
            _this._trigger(t,ITERATE_KEY_SET_MAP)
            break;
        }


        return val
      }

      return res
    },{})
  })(['add','clear','delete','get','set','forEach',Symbol.iterator],this)

  //#endregion

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
  // 给wrapper 上添加属性_v_isRef用来标识一个ref
  _set_v_isRef_key(wrapper) {
    Object.defineProperty(wrapper,'_v_isRef',{ value: true,})
  }
  // 对原始值包裹成 对象，然后reactive响应式化
  ref(value) {
    const wrapper = { value }
    this._set_v_isRef_key(wrapper)
    return this.reactive(wrapper)
  }
  // 使响应式对象可以结构，不丢失响应式的特性
  toRef(obj,key) {
    const wrapper = {
      get value() { return obj[key] },
      set value(val) { obj[key] = val; return true }
    }
    this._set_v_isRef_key(wrapper)
    return wrapper
  }
  // 使 响应式对象可以解构，不丢失响应式的特性

  toRefs(obj,deep) {
    const wrapper = {}

    for (let k in obj) wrapper[k] = this.toRef(obj,k)
    return wrapper
  }
  // 脱ref,可 代理refs处理后的对象，可直接使用，不需要通过.value 来访问
  // vue中模板可以直接访问ref而不需用value就是这个原因
  proxyRefs(target) {
    // const _this=this
    return new Proxy(target,{
      get(t,k) {
        const val = Reflect.get(t,k)
        // if (k === 'c') debugger
        return val?._v_isRef ? val.value : val

      },
      set(t,k,newVal,r) {
        const val = t[k]
        return val?._v_isRef ? (val.value = newVal,true)
          : Reflect.set(t,k,newVal)

      }
    })
  }
  /**对结果响应式包装 */
  wrap = (val,options) => !options.isShallow && typeof val === 'object' && val !== null ? this.reactive(val,options) : val
  /** 微任务 */
  jobPlan = {
    jobQueue: new Set(),  // 任务队列,set去重，相同任务执行一次
    p: Promise.resolve(), //创建promise实例，将job添加到微任务队列
    isFlushing: false,  //队列刷新状态
    // 该功能实现 连续多次修改响应式数据但只会触发一次更新
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

    //清除副作用函数的依赖项
    const cleanup = (effectFn) => {
      effectFn.deps.forEach(item => item.delete(effectFn))
      effectFn.deps.length = 0
    }
    // 包装副作用函数
    const effectFn = () => {
      cleanup(effectFn)
      this.activeEffect = effectFn
      this.activeEffectStack.push(effectFn)  //若发生effect 嵌套，activeEffectStack栈可实现回溯
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

    const { _shouldTrack,activeEffectStack,bucket,activeEffect } = this
    if (!_shouldTrack || activeEffectStack.length === 0) return  //全局_shouldTrack 以及 activeEffectStack 决定追踪
    let depsMap = bucket.get(target)
    !depsMap && bucket.set(target,(depsMap = new Map()))
    let deps = depsMap.get(key)
    !deps && depsMap.set(key,(deps = new Set()))
    deps.add(activeEffect)
    //给当前activeEffect 收集依赖项deps，方便之后从key 的deps里删除activeEffect
    activeEffect.deps.push(deps)
  }
  //触发副作用
  _trigger(target,key,params = {}) {

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
    // if (typeof key === 'symbol') debugger
    if (Array.isArray(target)) {
      if (key === 'length') {
        // 数组修改length 会影响 数组中index大于等于newVal的元素
        depsMap.forEach((effects,k) => newVal <= k && effects.forEach(cb))
      } else if (Number.isInteger(+key) && type === this.TRIGGER_TYPE.ADD) {
        depsMap.get('length')?.forEach(cb)
      }
    } else if (type === this.TRIGGER_TYPE.ADD || type === this.TRIGGER_TYPE.DELETE) {
      depsMap.get(this.ITERATE)?.forEach(cb) //与ITERATE相关的副作用函数
    }

    effectsToRun.forEach(effectFn => {
      const sheduler = effectFn.options.sheduler
      if (sheduler) {
        sheduler(effectFn,values)
      } else effectFn()
    })
  }
  /**
   * @typedef reactiveOptions
   * @property {boolean} isShallow 深度响应 
   * @property {boolean} isReadonly 只读属性
   * @param  data 需要代理的原始数据
   * @param {reactiveOptions} options 
   */
  reactive(data,options = {}) {

    // 检查 data 是否已有代理，若有直接返回
    const existentProxy = this.reactiveMap.get(data)
    if (existentProxy) return existentProxy
    const _this = this
    const { RAW_KEY,ITERATE_KEY_SET_MAP,TRIGGER_TYPE: { ADD,DELETE,SET } } = _this
    const { isReadonly } = options
    const isArrayMethod = (key) => key !== 'length' && Array.prototype.hasOwnProperty(key)

    const proxy = new Proxy(data,{

      // 拦截读取操作
      get(target,key,r) {
        if (key === RAW_KEY) return target
        const isArr = Array.isArray(target)
        let res
        // 判断需要追踪的 情况
        if (!isReadonly && typeof key !== 'symbol') {
          if (isArr) {
            !isArrayMethod && _this._track(target,key)
          } else if (target instanceof Set) {
            key === 'size' && _this._track(target,ITERATE_KEY_SET_MAP)
          } else {
            _this._track(target,key)
          }
        }
        // 添加副作用
        // 代理部分数组方法 
        // console.log(key)

        if (isArr && _this.ArrayInstrmentations.hasOwnProperty(key)) {
          res = Reflect.get(_this.ArrayInstrmentations,key,r)
        } else if (target instanceof Set || target instanceof Map) {
          // 代理部分Set 方法
          if (_this.MutableInstrumentations.hasOwnProperty(key)) {
            res = Reflect.get(_this.MutableInstrumentations,key)
          } else {
            res = Reflect.get(target,key,target)
          }
        } else {
          res = Reflect.get(target,key,r)
        }
        // 若 res 是函数须绑定this 到 Set 自身,Set的方法才能调用
        // typeof res === 'function' && (res = res.bind(target))

        // 判断 res 类型，实现深度响应
        return _this.wrap(res,options)
      },
      // 拦截设置操作
      set(target,key,newVal,r) {
        // if (key === 'length') console.log('d',target)

        const oldVal = target[key]
        const hasKey = Object.prototype.hasOwnProperty.call(target,key)
        // type   若是数组 根据 length判断，如不是 根据hasOwnProperty

        const type = hasKey ? SET : ADD

        if (isReadonly) return console.warn(`属性${key}为只读属性`)
        // 设置属性值
        const res = Reflect.set(target,key,newVal)
        // 为真时，才执行 triggle，屏蔽由原型引起的更新，避免不必要的更新操作。
        if (r[RAW_KEY] === target) {
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
        // _this.log('t',t)
        _this._track(t,Array.isArray(t) ? 'length' : _this.ITERATE)
        return Reflect.ownKeys(t)
      },
      //拦截 delete,会触发for in 相关的副作用
      deleteProperty(t,k) {
        if (isReadonly) return console.warn(`属性${k}为只读属性`)
        const hasKey = Object.prototype.hasOwnProperty.call(t,k)
        const res = Reflect.deleteProperty(t,k)
        const key = Array.isArray(t) ? 'length' : _this.ITERATE
        if (res && hasKey) _this._trigger(t,key,{ type: DELETE })
        return res
      }

    })
    this.reactiveMap.set(data,proxy)
    return _this.proxyRefs(proxy)
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

export default Reactivity