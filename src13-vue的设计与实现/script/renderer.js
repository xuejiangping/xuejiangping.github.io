
import defaultRendererOptions from './defaultRendererOptions.js'


/**
 * 实现渲染器
 */
class Renderer {
  /**
  * @typedef VNODE
  * @type {object}
  * @property {string|HTMLELEMENT} type
  * @property {(null|VNODE[]|string)} children
  * @property {HTMLELEMENT} el
  */


  /**
  * @typedef defaultOptons
  * @property {()=>} createElement
  * @property {()=>} setElementText
  * @property {()=>} insert
  * @property {()=>} patchProps
  * @property {()=>} removeElement
  * 
   */
  /**
   * @param {defaultOptons} options
   */
  constructor(options) {
    this.rendererOptions = options || Renderer.defaultOptions
  }
  static defaultOptions = defaultRendererOptions
  // 辅助生成vNode 的函数
  h(type,...args) {
    return (Array.isArray(args[0]) || typeof args[0] === 'string')
      ? { type,children: args[0] }
      : { type,props: args[0],children: args[1] }
  }

  /**
   * @param {VNODE} vNode 
   * @param {HTMLElement} container 
   */
  mountElement(vNode,container) {
    const { type,props,children } = vNode
    const { createElement,setElementText,insert,patchProps } = this.rendererOptions
    const el = vNode.el = createElement(type)
    if (props) { //为元素设置属性
      /* HTML Attributes 指的是定义在HTML标签上的属性，如：id="app"
       DOM Attributes 指的是存在于DOM元素上的属性
       HTML Attributes 与DOM Attributes 具有相同名的属性为直接映射
       HTML Attributes 作用是设置与之对应的DOM Attributes初始值
        HTML Attributes是静态的，DOM Attributes则始终是当前的值
        el.defaultValue 和 getAttribute 获得的是dom的初始值
       */
      for (const k in props) {
        patchProps(el,k,null,props[k])
      }
    }
    if (typeof children === 'string') {
      setElementText(el,children)
    } else if (Array.isArray(children)) {
      children.forEach(v => this.patch(null,v,el))
    }
    insert(el,container)
  }
  patchElement(n1,n2) {

  }

  /**
   * 打补丁
   * @param {VNODE} n1 旧vNode
   * @param {VNODE} n2 新vNode
   * @param {HTMLElement} container 
   */
  patch(n1,n2,container) {
    if (n1 && n1.type !== n2.type) {
      this.unmount(n1); n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
      if (!n1) {  // 挂载
        this.mountElement(n2,container)
      } else { //打补丁 对比n1,n2

      }
    } else if (typeof type === 'object') {// 类组件

    } else if (typeof type === 'function') {// 函数式组件

    }

  }
  // 卸载组件
  unmount(vNode) {
    this.rendererOptions.removeElement(vNode)
  }
  /**
   * @param {VNODE} vNode 
   * @param {HTMLElement} container 
   */
  render(vNode,container) {
    if (vNode) {
      this.patch(container._vNode,vNode,container)
    } else {
      this.unmount(container._vNode)
    }
    container._vNode = vNode
  }
  // 序列化 class
  normalizeClass(data) {
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

}
export default Renderer