// 适用于浏览器的 默认渲染配置

export default {
  createElement: (tag) => document.createElement(tag),
  setElementText: (el,text = '') => el.textContent = text,
  insert: (el,parent,anchor = null) => parent.insertBefore(el,anchor),
  removeElement(vNode) {
    const el = vNode.el,parent = el?.parentElement
    parent?.removeChild(el)
  },
  /**
   * @param {string} k 
   * @param {HTMLElement} el
   * 
   * 
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
    if (k === 'class') {
      el.className = nextVal || ''
    } else if (/^on/.test(k)) {
      let invokers = el._vei || (el._vei = {}) //通过invoker 来模拟事件添加和移除,可以缓存事件提高性能
      let invoker = invokers[k]
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


