// 适用于浏览器的 默认渲染配置

// 序列化 class
function normalizeClass(data) {
  const _ = (data) => {
    const type = typeof data
    if (type === 'string') {
      return data.split(' ')
    } else if (Array.isArray(data)) {
      return data.flatMap(v => _(v))
    } else if (type === 'object') {
      return Object.entries(data).reduce((t,[k,v]) => (v && t.push(k),t),[])
    }
  }
  return _(data).join(' ')
}
// 序列化 style
function normalizeStyle(data) {
  const _ = (data) => {
    const type = typeof data
    if (type === 'string') {
      return data.split(';')
    } else if (Array.isArray(data)) {
      return data.flatMap(v => _(v))
    } else if (type === 'object') {
      return Object.entries(data).reduce((t,[k,v]) => (t.push(`${k}:${v}`),t),[])
    }
  }
  return _(data).join(';')
}
// 取得递增子序列
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i,j,u,v,c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

export default {
  getSequence,
  createElement: (tag) => document.createElement(tag),
  createText: (text) => new Text(text),
  setText: (node,text = '') => {
    if (node.nodeType === Node.TEXT_NODE) node.nodeValue = text
    else node.textContent = text
  },
  createComment: (text) => new Comment(text),
  setComment: (node,text) => node.nodeValue = text,
  setComment: (node,text) => node.nodeValue = text,
  insert: (el,parent,anchor = null) => parent.insertBefore(el,anchor),
  removeElement(vNode) {
    const el = vNode.el,parent = el?.parentElement
    parent?.removeChild(el)
  },

  /**
   * @param {string} k 
   * @param {HTMLElement} el
  */
  patchProps(el,k,preVal,nextVal) {
    /* HTML Attributes 指的是定义在HTML标签上的属性，如：id="app"
      DOM Attributes 指的是存在于DOM元素上的属性
      HTML Attributes 与DOM Attributes 具有相同名的属性为直接映射
      HTML Attributes 作用是设置与之对应的DOM Attributes初始值
       HTML Attributes是静态的，DOM Attributes则始终是当前的值
       el.defaultValue 和 getAttribute 获得的是dom的初始值
      */

    // 判断是否用 el[k] / setAttribute() 来设定属性
    const _shouldSetAsProps = (el,k,val) => {
      if (k === 'form' && el.tagName === 'INPUT') return
      return k in el
    }
    if (k === 'className') {
      el.className = normalizeClass(nextVal) || ''
    } else if (k === 'style') {
      el.setAttribute(k,normalizeStyle(nextVal))
    } else if (/^on/.test(k)) {
      let invokers = el._vei || (el._vei = {}) // 命名说明：vei (virtual-event-invoker)
      let invoker = invokers[k] //通过invoker 来模拟事件添加和移除,可以缓存事件提高性能
      const name = k.slice(2).toLowerCase()
      if (nextVal) {
        if (invoker) {
          invoker.value = nextVal
        } else {
          /** @param {Event} e */
          invoker = el._vei[k] = (e) => {
            const val = invoker.value
            // console.log('e','\n',e.timeStamp,'\n',invoker.attachedTime,'\n',el)
            if (invoker.attachedTime > e.timeStamp) return //对比触发事件的时间和绑定事件的时间可判断
            Array.isArray(val) ? val.forEach(fn => fn(e)) : val(e)
          }
          invoker.value = nextVal
          invoker.attachedTime = performance.now()  //记录绑定事件的时间点
          el.addEventListener(name,invoker)
        }
      } else if (invoker) {
        el.removeEventListener(name,invoker)
      }

    } else if (_shouldSetAsProps(el,k)) {
      if (typeof el[k] === 'boolean' && nextVal === '') el[k] = true
      else el[k] = nextVal
    } else {
      el.setAttribute(k,nextVal)
    }

  }
}


