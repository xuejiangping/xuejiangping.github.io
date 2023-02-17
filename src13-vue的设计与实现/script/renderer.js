
import defaultRendererOptions from './defaultRendererOptions.js'


/**
 * 实现渲染器
 */
class Renderer {


  /**
  * @typedef  VNODE
  * @property {string|HTMLElement} type
  * @property {null|VNODE[]|string} children
  * @property {HTMLElement} el
  * @property {object} props
  */

  constructor(options = defaultRendererOptions) {
    this.rendererOptions = options
  }
  // 辅助生成vNode 的函数
  h(type,...args) {
    const [a,b] = args
    return (Array.isArray(a) || typeof a === 'string')
      ? { type,children: a }
      : { type,props: a && typeof a === 'object' ? a : {},children: b }
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
      for (const k in props) {
        patchProps(el,k,null,props[k])
      }
    }
    if (typeof children === 'string') {
      setElementText(el,children)
    } else if (Array.isArray(children)) {
      children.forEach(c => this.patch(null,c,el))
    }
    insert(el,container)
  }
  /**
   * 
   * @param {VNODE} n1 
   * @param {VNODE} n2 
   */
  patchElement(n1,n2) {
    // 更新props
    const { patchProps } = this.rendererOptions
    const el = n2.el = n1.el,newProps = n2.props,oldProps = n1.props
    for (let k in newProps) { //添加新的props
      if (k in oldProps) {
        oldProps[k] !== newProps[k] && patchProps(el,k,oldProps[k],newProps[k])
      } else {
        patchProps(el,k,null,newProps[k])
      }
    }
    for (let k in oldProps) { //删除不存在的props
      if (!(k in newProps)) patchProps(el,k,oldProps[k],null)
    }
    // 更新children

    this.patchChildren(n1,n2,el)
  }

  /**
  * 
  * @param {VNODE} n1 
  * @param {VNODE} n2 
  * @param {HTMLElement} container
  */
  patchChildren(n1,n2,container) {
    console.log(n1,n2)
    const { setElementText } = this.rendererOptions
    if (typeof n2.children === 'string') {
      setElementText(container,n2.children)
      Array.isArray(n1.children) && n1.children.forEach(c => this.unmount(c))
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // 这里说明 新旧节点都是一组子节点 ，需要Diff算法比较子节点的变化 。。。
        console.log('Diff')
        n1.children.forEach(c => this.unmount(c))
        n2.children.forEach(c => this.patch(null,c,container))
      } else { //旧节点children是文本或者空，则清空后渲染新的子节点
        setElementText(container)
        n2.children.forEach(c => this.patch(null,c,container))
      }
    }

  }

  /**
   * 打补丁
   * @param {VNODE} n1 旧vNode
   * @param {VNODE} n2 新vNode
   * @param {HTMLElement} container 
   */
  patch(n1,n2,container) {
    if (n1 && n1.type !== n2.type) { // 如果n1 n2 存在，且type不相等，直接卸载旧的vNode，挂载新的
      this.unmount(n1); n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
      if (!n1) {  // 挂载
        this.mountElement(n2,container)
      } else { //打补丁 对比n1,n2
        // this.mountElement(n2,container)
        this.patchElement(n1,n2)
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