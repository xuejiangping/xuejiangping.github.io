
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
  /**@enum */
  TYPES = {
    Text: Symbol('Text'),
    Comment: Symbol('Comment'),
    Fragment: Symbol('Fragment')
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
    const { createElement,insert,patchProps,createText } = this.rendererOptions
    const el = vNode.el = createElement(type)
    el._vNode = vNode

    if (props) { //为元素设置属性
      for (const k in props) {
        patchProps(el,k,null,props[k])
      }
    }
    if (typeof children === 'string') {
      insert(createText(children),el)
    }
    Array.isArray(children) && children.forEach(c => this.patch(null,c,el))
    insert(el,container)
  }
  /**
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
    // console.log(n1,n2)
    const { setText } = this.rendererOptions
    if (typeof n2.children === 'string') { // 新子节点是 文本
      setText(container,n2.children)
      Array.isArray(n1.children) && n1.children.forEach(c => this.unmount(c))
    } else if (Array.isArray(n2.children)) { //新子节点是一组子节点
      if (Array.isArray(n1.children)) { //新旧节点都是一组子节点，diff 比较
        console.log('Diff')
        n1.children.forEach(c => this.unmount(c))
        n2.children.forEach(c => this.patch(null,c,container))
      } else { //旧节点children是文本或者空，则清空后渲染新的子节点
        setText(container)
        n2.children.forEach(c => this.patch(null,c,container))
      }
    } else {  // 新子节点 不存在
      if (typeof n1.children === 'string') setText(container)
      else if (Array.isArray(n1.children)) n1.children.forEach(c => this.unmount(c))
    }

  }

  /**
   * 打补丁
   * @param {VNODE} n1 旧vNode
   * @param {VNODE} n2 新vNode
   * @param {HTMLElement} container 
   */
  patch(n1,n2,container) {
    const { TYPES: { Text,Comment,Fragment },
      rendererOptions: { createText,insert,createComment,setText,setComment } } = this
    if (n1 && n1.type !== n2.type) { // 如果n1 n2 存在，且type不相等，直接卸载旧的vNode，挂载新的
      this.unmount(n1); n1 = null
    }

    const { type } = n2
    if (typeof type === 'string') { //元素节点
      if (!n1) {  // 挂载
        this.mountElement(n2,container)
      } else { //打补丁 对比n1,n2
        // this.mountElement(n2,container)
        this.patchElement(n1,n2)
      }
    } else if (type === Text) {  //文本节点
      if (n1) setText(n1.el,n2.children)
      else insert(createText(n2.children),container)
    } else if (type === Comment) {  //注释节点
      if (n1) setComment(n1.el,n2.children)
      else insert(createComment(n2.children),container)
    } else if (type === Fragment) { //空白文档
      if (n1) this.patchChildren(n1,n2,container)
      else n2.children(c => this.patch(null,c,container))
    }
    else if (typeof type === 'object') {// 类组件

    } else if (typeof type === 'function') {// 函数式组件

    }

  }
  // 卸载组件
  unmount(vNode) {
    if (vNode.type === this.TYPES.Fragment) {
      vNode.children.forEach(c => this.unmount(c))
    }
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