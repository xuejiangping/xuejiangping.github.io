
/**
 *  求函数 fn 的定积分
 * @class
 */
class IntegralSolution {
  /**
   * @param {function} fn 积分函数
   * @param {number} a 下限
   * @param {number} b 上限
   * @param {number} n 测试值，理论趋于无穷
   */
  constructor(fn,a,b,n = 100) {
    this.fn = fn
    this.a = a
    this.b = b
    this.n = n
  }
  get dx() { return (this.b - this.a) / this.n }
  resetArgs(fn,a,b,n) {  // 重新参数
    this.fn = fn
    this.a = a
    this.b = b
    this.n = n
  }

  myReduce(n,cb,initialValue) { //循环工具函数,模拟 无穷累加
    for (let i = 0; i < n; i++) {
      initialValue = cb(initialValue,i)
    }
    return initialValue
  }
  rectangle() {  //矩形法
    const { fn,n,dx,a,myReduce } = this
    let res = myReduce(n,(t,i) => t + fn(i * dx + a),0) * dx
    return res
  }
  trapezoid() { //梯形
    const { fn,n,dx,a,myReduce } = this
    // 累加=> 上底加下底 => 最后乘以 dx/2
    let res = myReduce(n,(t,i) => i > 0 ? t + fn((i - 1) * dx + a) + fn(i * dx + a) : t,0) * dx / 2
    return res
  }

  parabolic() {
    const { fn,n,dx,a,b,myReduce } = this
    let y1 = fn(a),y2 = fn((a + b) / 2),y3 = fn(b)
    // const getParabolic = ()=>{
    //   y1=p*x**2+q*x+r
    // }
  }

}
/** @property {IntegralSolution} demo */
let demo = new IntegralSolution((x) => 9.8 * x,0,3,1000)
console.log('矩形法',demo.rectangle())
console.log('梯形法',demo.trapezoid())

console.log(121)