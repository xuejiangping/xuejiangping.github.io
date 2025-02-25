// 将模块 绑定到全局对象
(function (root,factory) {
  console.log('没有模块环境，直接挂载在全局对象上')
  if (!root) return console.error('未找到全局对象')
  return root.umdModule = factory(root);
}(typeof this === 'object' ? this
  : typeof global === 'object' ? global
    : typeof globalThis === 'object' ? globalThis
      : typeof window === 'object' ? window : null,
  function (global) {

    // 寻找元素
    const findElement = ((lastDoc,frames) => {
      return function (selectors,isAll = false) {
        let res,doc
        if (lastDoc) {
          if (isAll) {
            res = lastDoc.querySelectorAll(selectors)
            if (res.length > 0) return res
          } else {
            res = lastDoc.querySelector(selectors)
            if (res) return res
          }
        }
        for (let i = 0; i < frames.length; i++) {
          try {
            doc = frames[i].document
          } catch (error) {
            continue
          }
          if (isAll) {
            res = doc.querySelectorAll(selectors)
            if (res.length > 0) {
              lastDoc = doc
              return res
            }
          } else {
            res = doc.querySelector(selectors)
            if (res) {
              lastDoc = doc
              return res
            }
          }
        }
        console.log('未找到元素',selectors)
      }
    })(global.document,global.frames);

    // 记录日志
    const log = (...msg) => console.log(`[${new Date().toLocaleTimeString()}]:`,...msg)
    // 睡眠
    const asleep = (time) => new Promise(res => setTimeout(res,time))
    //hash 加密
    function hash(algorithm,data) {
      if (typeof data === 'string') {
        const encoder = new TextEncoder()
        data = encoder.encode(data)
      }
      if (window.crypto.subtle) {
        return crypto.subtle.digest(algorithm,data).then(ab => {
          return [... new Uint8Array(ab)].map(v => v.toString(16).padStart(2,'0')).join('')
        })
      } else {
        console.error('当前环境中无 crypto')
      }
    }
    // 通过 createNodeIterator  条件 遍历dom 元素
    function traverseDom(dom,filterFn) {
      const nodeIterator = document.createNodeIterator(
        dom,
        NodeFilter.SHOW_ELEMENT,
        (node) => filterFn(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      );
      const pars = [];
      let currentNode;
      while (currentNode = nodeIterator.nextNode()) {
        pars.push(currentNode);
      }
      return pars
    }
    // ============
    function watchMouseOnDOM(domEl,{
      mousedownHandler = ({ x,y }) => console.log('mousedownHandler',x,y),
      mouseMoveHandler = ({ x,y }) => console.log('mouseMoveHandler',x,y),
      mouseUpHandler = ({ x,y }) => console.log('mouseUpHandler',x,y),
    } = {}) {

      const _mousedownHandler = ({ offsetX: x,offsetY: y }) => {
        mousedownHandler({ x,y })

        //===============================================================
        domEl.addEventListener('mousemove',_mouseMoveHandler)
        domEl.addEventListener('mouseup',_mouseUpHandler)
      }
      const _mouseMoveHandler = ({ offsetX: x,offsetY: y }) => mouseMoveHandler({ x,y })

      const _mouseUpHandler = ({ offsetX: x,offsetY: y }) => {
        mouseUpHandler({ x,y })
        domEl.removeEventListener('mousemove',_mouseMoveHandler)
        domEl.removeEventListener('mouseup',_mouseUpHandler)
      }

      domEl.addEventListener('mousedown',_mousedownHandler)
      return () => domEl.removeEventListener('mousedown',_mousedownHandler)
    }



    return {
      findElement,log,asleep,hash,traverseDom,watchMouseOnDOM
    }

  }))