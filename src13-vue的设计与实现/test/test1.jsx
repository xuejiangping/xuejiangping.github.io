import Reactivity from '../script/reactivity.js'
import Renderer from '../script/renderer.js'

// const reactivity = new Reactivity()

// //#region 原始数据
// const rawData = {
//   obj1: { name: 'a',age: 12,},
//   obj2: { title: 'MyVue',n: 1,m: 0,o: 3 },
//   obj3: { a: 1,b: 2,c: { d: 3 } },
//   obj4: { e: { f: 'f' } },
//   arr1: [{ a: 1 },2,3],
//   set1: new Set([1,2]),
//   map1: new Map([['a',1],['b',{ c: 3 }]])
// }
// //#endregion

// //#region reactive数据
// /**
//  * @typedef {object} reactiveData
//  * @property {Set<number>} set1
//  * @property {Map} map1
//  */
// /**@type {reactiveData} */
// const reactiveData = {
//   obj1: reactivity.reactive(rawData.obj1),
//   obj2: reactivity.reactive(rawData.obj2),
//   obj3: reactivity.reactive(rawData.obj3,{ isReadonly: true }),
//   obj4: reactivity.shallowReactive(rawData.obj4,{ isReadonly: true }),
//   arr1: reactivity.reactive(rawData.arr1),
//   set1: reactivity.reactive(rawData.set1),
//   map1: reactivity.reactive(rawData.map1)
// }

// //#endregion

// window.test = { rawData,reactiveData,reactivity }

// //#region  测试各项功能
// // 测试 计算属性
// let sumRes = reactivity.computed(() => reactiveData.obj2.m + reactiveData.obj2.n)

// // 测试 watch 和 任务时效
// // reactivity.watch(reactiveData.obj3,(oldVal,newVal,onInvalid) => {
// //   let expired = false
// //   onInvalid(() => expired = true)
// //   // await 耗时异步任务(),若在等待期间副作用函数再次执行，开始新的异步任务
// //   // () => expired = true 会执行，导致不会继续执行
// //   if (expired) return
// //   // 若任务没有过期，继续执行下面代码
// //   // console.log('watch 和 任务时效')
// //   reactivity.log('watch 和 任务时效')
// // },{ immediate: false })


// /**  更新Node  */
// const App = () => h('div',{ id: 'app' },[
//   h('div',{ style: 'color:red;font-size:50px' },reactiveData.obj2.title),
//   h('button',{ onClick: () => alert(new Date) },'显示时间'),
//   h(ComponentA),
//   h(ComponentB),
//   h('h1',null,'name:' + reactiveData.obj1.name),
//   h('h1',null,'age:' + reactiveData.obj1.age),
//   h('h1',null,'测试计算属性sumRes:' + sumRes.value),

// ])

// // 测试 响应式 renderer 渲染器
// reactivity.effect(() => {
//   reactivity.renderer(App,document.body)
// })
// // 测试 副作用函数fn放入微队列,多次修改响应式数据，放入微队列，只执行最终结果
// // reactivity.effect(() => reactiveData.obj2.n,{
// //   sheduler(fn) {
// //     reactivity.jobPlan.jobQueue.add(fn)
// //     reactivity.jobPlan.flushJob()
// //   }
// // })
// // 测试 for in
// // reactivity.effect(() => {
// //   for (let k in reactiveData.obj2) {
// //     console.log('测试 for in ==>',k,reactiveData.obj2[k])
// //   }
// // })
// // delete reactiveData.obj2.n

// // 测试 避免因原型引起的不必要的更新
// // Object.setPrototypeOf(rawData.obj1,rawData.obj2)
// // reactivity.effect(() => reactivity.log('避免因原型引起的不必要的更新',reactiveData.obj1.o))

// // 测试 深响应
// // reactivity.effect(() => {
// //   reactivity.log('深响应',reactiveData.obj3.c.d)
// // })
// // reactiveData.obj3.c.d = 4

// //测试 浅响应
// // reactivity.effect(() => {
// //   reactivity.log('浅响应',reactiveData.obj4.e.f)
// // })
// // reactiveData.obj3.e = { f: '88' }
// //测试 数组
// // reactivity.effect(() => reactivity.log('测试 数组',reactiveData.arr1[2]))
// // reactiveData.arr1[2] = 3

// // reactivity.effect(() => reactiveData.arr1.forEach(v => reactivity.log('数组循环',v)))

// // reactivity.effect(() => {
// //   for (let v of reactiveData.arr1) {
// //     reactivity.log('v',v)
// //   }
// //   // reactiveData.arr1.push(1)
// // })

// // 测试 set 集合
// // reactivity.effect(() => reactivity.log('测试 set 集合',reactiveData.set1.size))

// // 测试 map
// // reactivity.effect(() => reactivity.log('测试 map',reactiveData.map1.get('a')))

// // reactivity.effect(() => {
// //   reactiveData.map1.forEach((v,k,m) => reactivity.log('测试 map',k,v,v.c))
// // })


// //#endregion


const R = new Reactivity()
const renderer = new Renderer()
const { TYPES: { Text,Comment,Fragment } } = renderer
// Object.defineProperties(_r.__proto__,{
//   ref: { enumerable: true },
// })
window.myVue = { R,renderer }
const a = R.ref(1)
const b = R.ref(false)
const { h } = renderer

// R.effect(() => render(`<h1>${a.value}</h1>`,document.body))
// R.effect(() => console.log(a.value))

document.onclick = () => a.value++
() => R.effect(() => {
  const vNode = h(Fragment,b.value && { onClick: () => console.log('父元素 clicked') },
    h('h2',{ style: 'color:red',className: ['test_1',{ test_2: true }] },'测试className ,style等props绑定'),
    h('h2',null,'测试响应式值：' + a.value),
    h('h2',{
      onClick: [() => console.log('click 事件'),() => console.log('click-alert')],
      onContextmenu: () => console.log('Contextmenu 事件')
    },'测试事件绑定'),
    // h('input',{ form: 'form1' })
    h('h2',{ onClick: () => b.value = !b.value },h('h3',{ className: 'test_1' },b.value ? 'text1' : 'text2')),
    h(Comment,null,'测试注释节点'),
    !b.value && h('h2',null,Array(5).fill().map((_,i) => h('div',null,'测试length' + i)))
  )
  renderer.render(vNode,document.querySelector('#app'))
})
// a.value = 99
// console.log('a',a)

// 旧 vnode


const oldVNode = {
  type: 'div',
  children: [
    { type: 'p',children: '1',key: 1 },
    { type: 'p',children: '2',key: 2 },
    { type: 'p',children: 'hello',key: 3 }
  ]
}

const newVNode = {
  type: 'div',
  children: [
    { type: 'p',children: '3',key: 4 },
    { type: 'p',children: 'world',key: 3 },
    { type: 'p',children: '1',key: 1 },
    { type: 'p',children: '2',key: 2 }
  ]
}

// 首次挂载
renderer.render(oldVNode,document.querySelector('#app'))
// setTimeout(() => {
//   // 1 秒钟后更新
//   renderer.render(newVNode,document.querySelector('#app'))
// },1000);

let t = <div>
  <ul>
    <li onClick={() => alert(122)}>demo</li>
    <li>demo</li>
    <li>demo</li>
    <li>demo</li>
    <li>demo</li>
  </ul>
  <h5 style={{ color: 'pink' }}>
    <div style={'color:red'}> 密码： <input type='password' /></div>
    <div> 账号： <input type='text' /></div>
  </h5>
</div>

renderer.render(t,document.querySelector('#app'))
