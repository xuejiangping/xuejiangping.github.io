
import defaultRendererOptions from './defaultRendererOptions.js'


/**
 * 实现渲染器
 */
class Renderer {


  /**
  * @typedef  VNODE
  * @property {string|HTMLElement} type
  * @property {VNODE[]|string|null} children
  * @property {HTMLElement} el
  * @property {object} props
  * @property {number|null} key
  * 
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
  h = ((key,{ TYPES: { Text } }) => function (type,props,...args) {

    return { key: key++,type,props,children: args.flatMap(c => typeof c === 'string' ? { type: Text,props: null,children: c } : c) }

  })(0,this)

  /**
   * @param {VNODE} vNode 
   * @param {HTMLElement} container 
   */
  mountElement(vNode,container,anchor) {
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
    } else if (Array.isArray(children)) {
      children.forEach(c => this.patch(null,c,el))
    }
    insert(el,container,anchor)
  }

  /**
   * 打补丁
   * @param {VNODE} n1 旧vNode
   * @param {VNODE} n2 新vNode
   * @param {HTMLElement} container 
   */
  patch(n1,n2,container,anchor) {
    console.log(n1,n2)
    // if (n2 === false) debugger
    const { TYPES: { Text,Comment,Fragment },rendererOptions: { createText,insert,createComment,setText,setComment } } = this
    if (n1 && n1.type !== n2.type) { // 如果n1 n2 存在，且type不相等，直接卸载旧的vNode，挂载新的
      this.unmount(n1); n1 = null
    }

    const { type } = n2

    if (typeof type === 'string') { //元素节点
      if (!n1) {  // 挂载
        this.mountElement(n2,container,anchor)
      } else { //打补丁 对比n1,n2
        this.patchElement(n1,n2)
      }
    } else if (type === Text) {  //文本节点
      if (n1) setText(n2.el = n1.el,n2.children)
      else insert(n2.el = createText(n2.children),container)
    } else if (type === Comment) {  //注释节点
      if (n1) setComment(n2.el = n1.el,n2.children)
      else insert(n2.el = createComment(n2.children),container)
    } else if (type === Fragment) { //空白文档
      if (n1) this.patchChildren(n1.children,n2.children,container)
      else n2.children.forEach(c => this.patch(null,c,container))
    }
    else if (typeof type === 'object') {// 类组件

    } else if (typeof type === 'function') {// 函数式组件

    }

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

    this.patchChildren(n1.children,n2.children,el)
  }

  /**
  * 
  * @param {VNODE} n1 
  * @param {VNODE} n2 
  * @param {HTMLElement} container
  */
  patchChildren(oldChildren,newChildren,container) {
    const { setText } = this.rendererOptions
    if (typeof newChildren === 'string') { // 新子节点是 文本
      Array.isArray(oldChildren) && oldChildren.forEach(c => this.unmount(c))
      setText(container,newChildren)

    } else if (Array.isArray(newChildren)) { //新子节点是一组子节点
      if (Array.isArray(oldChildren)) { //新旧节点都是一组子节点，diff 比较
        console.log('Diff')
        //-------------------Diff-------------------
        // this.diff(oldChildren,newChildren,container)
        this.doubleEndDiff(oldChildren,newChildren,container)
      } else { //旧节点children是文本或者空，则清空后渲染新的子节点
        setText(container)
        newChildren.forEach(c => this.patch(null,c,container))
      }
    } else {  // 新子节点 不存在
      if (typeof oldChildren === 'string') setText(container)
      else if (Array.isArray(oldChildren)) oldChildren.forEach(c => this.unmount(c))
    }

  }
  /**
   * 简单diff算法
   * @param {VNODE[]} oldChildren 
   * @param {VNODE[]} newChildren
   */
  diff(oldChildren,newChildren,container) {
    oldChildren
    let lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      const newVnode = newChildren[i]
      let find = false
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVnode = oldChildren[j]
        if (newVnode.key === oldVnode.key) {
          find = true  //找到相同的 key 可以复用
          this.patch(oldVnode,newVnode,container)
          if (j < lastIndex) { //需要调整位置
            const prevVnode = newChildren[i - 1]
            if (prevVnode) {
              const anchorEl = prevVnode.el.nextSibling
              this.rendererOptions.insert(oldVnode.el,container,anchorEl)
            }
          } else lastIndex = j
          break
        }
      }
      // 若没有找到key 说明新元素，需要挂载
      if (!find) {
        let anchorEl = newChildren[i - 1]?.el.nextSibling || container.firstChild
        this.patch(null,newVnode,container,anchorEl)
      }
    }
    // 卸载 不存在的元素
    oldChildren.forEach(oldVnode => {
      const has = newChildren.some(newVnode => oldVnode.key === newVnode.key)
      if (!has) this.unmount(oldVnode)
    })


  }
  /**
    * 双端 diff算法
    * @param {VNODE[]} oldChildren 
    * @param {VNODE[]} newChildren
    */
  doubleEndDiff(oldChildren,newChildren,container) {

    let newStartIdx = 0,newEndIdx = newChildren.length - 1
    let oldStartInx = 0,oldEndIdx = oldChildren.length - 1
    let newStartVnode = newChildren[newStartIdx],newEndVnode = newChildren[newEndIdx]
    let oldStartVnode = oldChildren[oldStartInx],oldEndVnode = oldChildren[oldEndIdx]
    const { insert } = this.rendererOptions
    // debugger
    while (newStartIdx <= newEndIdx && oldStartInx <= oldEndIdx) {
      if (!oldStartVnode) {  //
        oldStartVnode = oldChildren[++oldStartInx]
      } else if (newStartVnode.key === oldStartVnode.key) { // 比较 新头部<==>旧头部
        this.patch(oldStartVnode,newStartVnode,container)
        newStartVnode = newChildren[++newStartIdx]
        oldStartVnode = oldChildren[++oldStartInx]
      } else if (newEndVnode.key === oldEndVnode.key) {  //比较 新尾部<==>旧尾部
        this.patch(oldEndVnode,newEndVnode,container)
        newEndVnode = newChildren[--newEndIdx]
        oldEndVnode = oldChildren[--oldEndIdx]
      } else if (newEndVnode.key === oldStartVnode.key) {  //新尾部<==>旧头部
        this.patch(oldStartVnode,newEndVnode,container)
        insert(oldStartVnode.el,container,oldEndVnode.el.nextSibling)
        oldStartVnode = oldChildren[++oldStartInx]
        newEndVnode = newChildren[--newEndIdx]
      } else if (newStartVnode.key === oldEndVnode.key) {  //新头部 <==> 旧尾部
        this.patch(oldEndVnode,newStartVnode,container)
        insert(oldEndVnode.el,container,oldStartVnode.el)
        oldEndVnode = oldChildren[--oldEndIdx]
        newStartVnode = newChildren[++newStartIdx]
      } else { //  无法通过比较头部和尾部得到结果的情况
        let idxInOld = oldChildren.findIndex(v => v.key === newStartVnode.key)
        if (idxInOld > 0) {
          let nodeToMove = oldChildren[idxInOld]
          oldChildren[idxInOld] = undefined
          this.patch(nodeToMove,newStartVnode,container)
          insert(nodeToMove.el,container,oldStartVnode.el)
          newStartVnode = newChildren[++newStartIdx]
        } else { //若在旧子节点中 找不到 newStartVnode相同的key ，说明需挂载为新节点
          this.patch(null,newStartVnode,container,oldStartVnode.el)
          newStartVnode = newChildren[++newStartIdx]
        }
      }
    }
    // 新 子节点剩余部分 需要被挂载
    if (oldEndIdx < oldStartInx && newStartIdx <= newEndIdx) {
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        this.patch(null,newChildren[i],container,oldStartVnode.el)
      }
      // 旧 子节点中多余的 需要删除
    } else if (newEndIdx < newStartIdx && oldStartInx <= oldEndIdx) {
      for (let i = oldStartInx; i <= oldEndIdx; i++) this.unmount(oldChildren[i])
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


}
export default Renderer