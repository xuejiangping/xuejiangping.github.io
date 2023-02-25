/**二叉搜索树 */

class BinaryTree {

  root = null
  size = 0



  createNode(...args) {
    const Node = function (key,value,left = null,right = null) {
      this.key = key
      this.value = value
      this.left = left
      this.right = right
    }
    return new Node(...args)
  }
  put(key,value) {
    this.root = this.#put(this.root,key,value)
    return this
  }
  #put(root,key,value) {
    if (root === null) {
      this.size++
      return this.createNode(key,value)
    }
    if (key < root.key) {
      root.left = this.#put(root.left,key,value)
    } else if (key > root.key) {
      root.right = this.#put(root.right,key,value)
    } else {
      root.value = value
    }
    return root
  }




}
let a = new BinaryTree()
console.log('a',a)
debugger