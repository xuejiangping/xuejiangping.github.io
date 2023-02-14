/**
* 生成vNode函数 
*/
function h(type,...args) {
  return (Array.isArray(args[0]) || typeof args[0] === 'string')
    ? { type,children: args[0] }
    : { type,props: args[0],children: args[1] }
}


/**
 * @typedef VNODE
 * @type {object}
 * @property {string} type
 * @property {(null|VNODE[]|string)} children
 */
/**
 * @typedef defaultOptons
 * @property {()=>} createElement
 * @property {()=>} setElementText
 * @property {()=>} insert
 */
class Renderer {
  constructor(options) {
    /**@type {defaultOptons} */
    this.rendererOptions = options || this.defaultOptons
  }
  defaultOptons = {
    createElement: (tag) => document.createElement(tag),
    setElementText: (el,text) => el.textContent = text,
    insert: (el,parent,anchor = null) => parent.insertBefore(el,anchor)
  }

  /**
   * @param {VNODE} vNode 
   * @param {HTMLElement} container 
   */
  mountElement(vNode,container) {
    const { type,children } = vNode
    const { createElement,setElementText,insert } = this.rendererOptions
    const el = createElement(type)
    if (typeof children === 'string') {
      setElementText(el,children)
    } else {
      children.forEach(v => this.mountElement(v,el))
    }
    insert(el,container)
  }
  /**
   * 
   * @param {VNODE} n1 旧vNode
   * @param {VNODE} n2 新vNode
   * @param {HTMLElement} container 
   */
  patch(n1,n2,container) {
    if (!n1) {  // 挂载
      this.mountElement(n2,container)
    } else { //打补丁 对比n1,n2

    }
  }
  /**
   * @param {VNODE} vNode 
   * @param {HTMLElement} container 
   */
  render(vNode,container) {
    if (vNode) {
      this.patch(container._vNode,vNode,container)
    } else {
      container.innerHTML = ''
    }
  }
}