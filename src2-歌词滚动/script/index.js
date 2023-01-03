import lrc from '../assets/六月的雨.js'
import start from './音频可视化.js'

const lrcList = document.querySelector('.lrclist')
/**
 * @constant {HTMLAudioElement} 
 */
const player = document.getElementById('player')
const container = document.getElementById('container')
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
const lrcData = parseLrc(lrc)
const playBtn = document.getElementById('playBtn')
player.controls = false
cvs.style.top = innerHeight / 3 + 'px'
cvs.width = innerWidth
cvs.height = innerHeight - innerHeight / 3
const { resume,supend,gainNode,drawMethods } = start(player,ctx,{ fillStyle: 'hotpink',fftSize: 256 })
ctx.strokeStyle = '#fff'
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


window.gainNode = gainNode
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
  return new Promise(res => {
    let i = 0,timer
    timer = setInterval(() => {
      if (++i === HZ) {
        clearInterval(timer)
        res()
      }
      fn()
    },gap)
  })
}

player.ontimeupdate = setOffsetY

//声音淡入
player.fadein = function (duration = 1000,volume = 0.5,hz = 10) {
  gainNode.gain.value = 0
  this.play()
  easingFn(() => {
    // this.volume += (volume / hz)
    gainNode.gain.value += (volume / hz)
  },duration / hz,hz)
}
//声音淡出
player.fadeout = function (duration = 2000,hz = 10) {
  let startVolume = +gainNode.gain.value.toPrecision(2)
  let i = hz
  easingFn(() => {
    let a = startVolume * (--i / 10)
    gainNode.gain.value = a
    // this.volume = v < 0 ? 0 : v
    // gainNode.gain.value = v
  },duration / hz,hz).then(() => {
    this.pause()
  })
}

playBtn.onclick = function () {
  if (player.paused) {
    player.fadein()
    player.play()
    resume()
  } else {
    player.pause()
    // player.fadeout()
    supend()
  }
}

document.onmousemove = function ({ pageY: y }) {
  let v = y / innerHeight
  gainNode.gain.value = v
}
function createSelectList() {
  const fragment = document.createDocumentFragment()
  for (const key in drawMethods) {
    console.log('key',key)
    if (Object.hasOwnProperty.call(drawMethods,key)) {
      let option = document.createElement('option')
      option.textContent = key

      fragment.appendChild(option)
    }
  }
  fragment.firstElementChild.defaultSelected = true
  let select = document.querySelector('select')
  select.appendChild(fragment)
  select.onchange = function () {
    console.log('this.value',this.value)
    drawMethods.default = drawMethods[this.value]
  }
}
createSelectList()



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
