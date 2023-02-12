const myVue = new MyVue()
//#region 原始数据
const rawData = {
  obj1: { name: 'a',age: 12,},
  obj2: { title: 'MyVue',n: 1,m: 0,o: 3 },
  obj3: { a: 1,b: 2,c: { d: 3 } },
  obj4: { e: { f: 'f' } },
  arr1: [{ a: 1 },2,3],
  set1: new Set([1,2])
}
//#endregion

//#region reactive数据
/**
 * @typedef {object} reactiveData
 * @property {Set<number>} set1
 */
/**@type {reactiveData} */
const reactiveData = {
  obj1: myVue.reactive(rawData.obj1),
  obj2: myVue.reactive(rawData.obj2),
  obj3: myVue.reactive(rawData.obj3,{ isReadonly: true }),
  obj4: myVue.shallowReactive(rawData.obj4,{ isReadonly: true }),
  arr1: myVue.reactive(rawData.arr1),
  set1: myVue.reactive(rawData.set1)
}

//#endregion

window.test = { rawData,reactiveData,myVue }

//#region  测试各项功能
// 测试 计算属性
let sumRes = myVue.computed(() => reactiveData.obj2.m + reactiveData.obj2.n)

// 测试 watch 和 任务时效
// myVue.watch(reactiveData.obj3,(oldVal,newVal,onInvalid) => {
//   let expired = false
//   onInvalid(() => expired = true)
//   // await 耗时异步任务(),若在等待期间副作用函数再次执行，开始新的异步任务
//   // () => expired = true 会执行，导致不会继续执行
//   if (expired) return
//   // 若任务没有过期，继续执行下面代码
//   // console.log('watch 和 任务时效')
//   myVue.log('watch 和 任务时效')
// },{ immediate: false })


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
// myVue.effect(() => {
//   for (let k in reactiveData.obj2) {
//     console.log('测试 for in ==>',k,reactiveData.obj2[k])
//   }
// })
// delete reactiveData.obj2.n

// 测试 避免因原型引起的不必要的更新
Object.setPrototypeOf(rawData.obj1,rawData.obj2)
myVue.effect(() => myVue.log('避免因原型引起的不必要的更新',reactiveData.obj1.o))

// 测试 深响应
myVue.effect(() => {
  myVue.log('深响应',reactiveData.obj3.c.d)
})
// reactiveData.obj3.c.d = 4

//测试 浅响应
myVue.effect(() => {
  myVue.log('浅响应',reactiveData.obj4.e.f)
})
// reactiveData.obj3.e = { f: '88' }
//测试 数组
myVue.effect(() => myVue.log('测试 数组',reactiveData.arr1[2]))
// reactiveData.arr1[2] = 3

myVue.effect(() => reactiveData.arr1.forEach(v => myVue.log('数组循环',v)))

// myVue.effect(() => {
//   for (let v of reactiveData.arr1) {
//     myVue.log('v',v)
//   }
//   // reactiveData.arr1.push(1)
// })

// 测试 set 集合
myVue.effect(() => myVue.log('测试 set 集合',reactiveData.set1.size))


//#endregion