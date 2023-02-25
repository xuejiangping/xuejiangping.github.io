/**
 * @typedef {({
*    type: string;
*    name: never[];
*    content?: undefined;
*} | {
*    type: string;
*    content: never[];
*    name?: undefined;
*})[]} tokens
*/
/**
 * @typedef {{
 *type: string;
 *tag: never[] | undefined;
 *props: any;
 *children: never[];
 *}} AST
 */

/**
 * @typedef {{
 *  currentNode: null;
 *  childIndex: number;
 *  parent: null;
 *  nodeTransforms: ((node: any, ctx: context) => void)[];
 *}} context
 */
const compilier = {
  state: {
    initial: 1,
    tagOpen: 2,
    tagName: 3,
    text: 4,
    tagEnd: 5,
    tagEndName: 6
  },
  /**
   * @param {string} str 
   */
  tokenize(str) {
    const { initial,tagOpen,text,tagName,tagEnd,tagEndName } = this.state
    let currentState = initial,i = 0
    let tokens = []
    let chars = []
    let currentNode = null
    const propsReg = /\S+(?=\=)=(?<=\=)".*?"|\S+/g
    while (i < str.length) {
      let char = str[i++]
      switch (char) {
        case '<':
          if (currentState === initial || currentState === text) {
            currentState = tagOpen
          }
          break;
        case '>':
          if (currentState === tagEndName || currentState === tagName) {
            if (currentState === tagName) {
              let str = chars.join('')
              let a = str.match(propsReg)
              if (!a) return
              currentNode.name = a[0]
              const entries = a.slice(1).map(v => v.split('='))
              currentNode.props = entries && Object.fromEntries(entries) || {}
            }
            currentState = initial
          }
          break;
        case '/':
          if (currentState === tagOpen) {
            currentState = tagEnd
          }
          break;

        default:
          if (currentState === tagOpen) {
            currentState = tagName
            tokens.push(currentNode = { type: 'tag',name: chars = [] })
          } else if (currentState === initial) { //文本
            currentState = text
            tokens.push(currentNode = { type: 'text',content: chars = [] })
          } else if (currentState === tagEnd) {
            currentState = tagEndName
            tokens.push(currentNode = { type: 'tagEnd',name: chars = [] })
          }
          chars.push(char)
          break;
      }
    }
    return tokens
  },

  parse(str) {
    const tokens = this.tokenize(str)
    /**@type {AST} */
    let root = null
    const elementStack = []

    tokens.forEach(token => {
      const parent = elementStack[elementStack.length - 1]
      const { type,props,content,name: tag } = token
      if (type === 'tag') {

        const elementNode = {
          type: 'Element',tag,props,children: []
        }
        if (elementStack.length === 0) {
          root = elementNode
        } else {
          parent.children.push(elementNode)
        }
        elementStack.push(elementNode)

      } else if (type === 'tagEnd') {
        elementStack.pop()
      } else if (type === 'text') {
        const textNode = {
          type: 'Text',
          children: content.join('')
        }
        if (elementStack.length === 0) {
          root = elementNode
        } else {
          parent.children.push(textNode)
        }
      }

    })
    return root
  },
  /**
   * 
   * @param {*} ast 
   * @param {context} ctx 
   */
  traverseNode(ast,ctx) {
    const currentNode = ctx.currentNode = ast
    ctx.nodeTransforms.forEach(fn => fn(currentNode,ctx))
    const children = currentNode.children
    if (children && Array.isArray(children)) {
      children.forEach((c,i) => {
        ctx.parent = currentNode
        ctx.childIndex = i
        this.traverseNode(c,ctx)
      })
    }
  },
  tansform(ast) {
    /**@type {context}*/
    const ctx = {
      currentNode: null,
      childIndex: 0,
      parent: null,
      nodeTransforms: []
    }
    this.traverseNode(ast,ctx)
  }


}

export default compilier
