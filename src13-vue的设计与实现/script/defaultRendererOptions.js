// 适用于浏览器的渲染配置

export default {
  createElement: (tag) => document.createElement(tag),
  setElementText: (el,text) => el.textContent = text,
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
    // 判断是否用 el[k] / setAttribute() 来设定属性
    const _shouldSetAsProps = (el,k,val) => {
      if (k === 'form' && el.tagName === 'INPUT') return
      return k in el
    }
    if (k === 'class') {
      el.className = nextVal || ''
    } else if (/^on/.test(k)) {
      let invokers = el._vei||(el._vei={}) //通过invoker 来模拟事件添加和移除,可以缓存事件提高性能
      let invoker=invokers[k]
      const name = k.slice(2).toLowerCase()
      if(nextVal){ 
        if (invoker) {
          invoker.value = nextVal
        } else {
          invoker = el._vei[k] = e => invoker.value(e)
          invoker.value = nextVal
          el.addEventListener(name,invoker)
        }
      }else if(invoker){
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


