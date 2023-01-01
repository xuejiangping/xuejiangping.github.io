import lrc from '../assets/六月的雨.js'
import start from './音频可视化.js'
// console.log('cc',cc)
// window.lrc = lrc
const lrcList = document.querySelector('.lrclist')
const player = document.getElementById('player')
const container = document.getElementById('container')
const cvs = document.getElementById('cvs')
const lrcData = parseLrc(lrc)

cvs.style.top = innerHeight / 5 + 'px'
cvs.width = innerWidth
cvs.height = innerHeight - innerHeight / 5
const { resume,supend } = start(player,cvs,{ fillStyle: 'hotpink',fftSize: 512 })

createLrcElements()
/**
 * 根据播放时间设置 滚动位置
 */
const setOffsetY = (function () {
  let oldIndex
  const lists = lrcList.children,
    halfContainerHeight = container.clientHeight / 2,
    maxOffsetY = lrcList.clientHeight - container.clientHeight

  return function () {
    const index = findIndex(this.currentTime)
    if (index === oldIndex) return
    oldIndex = index
    document.querySelector('.active')?.classList.remove('active')

    const li = lists[index]
    li.classList.add('active')
    let offsetY = li.offsetTop - halfContainerHeight

    if (offsetY < 0) { offsetY = 0 }
    else if (offsetY > maxOffsetY) { offsetY = maxOffsetY + li.clientHeight }
    else { offsetY += li.clientHeight }
    lrcList.style.transform = `translateY(${-offsetY}px)`
  }
})()


/**
 * 格式化lrc歌词的时间，单位：秒
 * @param {String} t 原歌词时间,格式 '00:00.00'
 * @returns {Number}  格式化后的歌词时间
 */
function formatLrcTime(t) {
  let [x,y] = t.split(':')
  return x * 60 + +y
}
/**
 * 解析歌词字符串
 * @param {String} lrc 需要解析的歌词
 * @returns object[]
 */
function parseLrc(lrc) {
  return lrc.split('\n').filter(v => v.trim())
    .map(v => {
      let res = v.match(/\[(.*)\](.*)/)
      return { time: formatLrcTime(res[1]),text: res[2] }
    })
}
/**
 * 根据播放时间找到对应歌词索引
 * @param {number} currentTime 当前播放时间
 * @returns {number}
 */
function findIndex(currentTime) {
  let index = lrcData.findIndex(v => v.time > currentTime) - 1
  return index >= 0 ? index : index === -1 ? 0 : lrcData.length - 1
}
/**
 * 生成歌词列表
 */
function createLrcElements() {
  const fragment = document.createDocumentFragment()
  lrcData.forEach(v => {
    let li = document.createElement('li')
    li.textContent = v.text
    fragment.appendChild(li)
  })
  lrcList.append(fragment)
}
/**
 * 
 * @param {Function} fn 需要使用缓动效果的回调函数
 * @param {Number} gap 时间间隔
 * @param {Number} HZ 回调执行频次
 */
// 缓动函数，用于将音频淡入淡出
function easingFn(fn,gap = 200,HZ = 5) {
  let i = 0,timer
  timer = setInterval(() => {
    if (++i === HZ) clearInterval(timer)
    fn()
  },gap)
}
player.ontimeupdate = setOffsetY

player.onplay = function () {
  resume()
  this.volume = 0
  easingFn(() => {
    this.volume += 0.05
  },200,10)

}

player.onpause = function () {
  supend()
}




// const ws = new WritableStream({
//   write(chunk) {
//     console.log(chunk)
//   },
//   close() {
//     console.log('结束了')
//   }
// })
// const writer = ws.getWriter()

// // writer.ready.then(() => writer.write(123))

// //===============================================
// const randomChar = () => Math.random().toString(36).substring(2)

// const rs = new ReadableStream({
//   start(cl) {
//     let i = 0,timer
//     timer = setInterval(() => {
//       if (++i == 5) clearInterval(timer)
//       cl.enqueue(randomChar())
//     },1000);
//   }
// })
// const reader = rs.getReader()
// while (true) {
//   const { value,done } = await reader.read()
//   if (done) break
//   writer.write(value)
// }
