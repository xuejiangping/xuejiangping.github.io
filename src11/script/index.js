/**
 * 生成虚拟Dom
 * @param {Node} rootNode 
 */
function createVirtualDom(rootNode) {
  let { nodeType,nodeValue,childNodes,nodeName,attributes } = rootNode
  const data = {
    nodeType,
    tag: nodeName.toLowerCase(),
    value: null,
    children: [],
    attrs: null
  }
  if (attributes?.length > 0) {
    data.attrs = [...attributes].reduce((t,{ nodeName,nodeValue }) => (!!nodeValue.trim() && (t[nodeName] = nodeValue),t),{})
  }
  if (nodeType === rootNode.ELEMENT_NODE) {
    let { length } = childNodes
    if (length > 0) data.children = [...childNodes].map(v => createVirtualDom(v))
  } else {
    data.value = nodeValue
  }
  return data
}


/**
 * 根据虚拟dom 生成真实dom
 * @param {*} vNode 
 * @returns 
 */
function createPageByVirtualDom(vNode) {
  // const fg = document.createDocumentFragment()
  const { children,tag,value,attrs,nodeType } = vNode
  const attrsValue = attrs ? Object.entries(attrs).reduce((t,[k,v]) => t + ` ${k}="${v}"`,'') : ''
  const innerValue = value || children.reduce((t,v) => t + createPageByVirtualDom(v),'')
  const html = nodeType === Node.ELEMENT_NODE ? `<${tag}${attrsValue}>${innerValue}</${tag}>` : value
  return html
}