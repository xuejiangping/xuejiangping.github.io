interface LinkListNodeType {
  value: any,
  next: LinkListNodeType | null,
  prev: LinkListNodeType | null

}

class LinkListNode implements LinkListNodeType {
  constructor(value: number | string) {
    this.value = value
    this.next = null
    this.prev = null

  }
  value: number | string
  next: LinkListNodeType | null
  prev: LinkListNodeType | null


}


function createLinkList(n: number) {
  const root = new LinkListNode('root')
  let temp = root
  for (let i = 0; i < n; i++) {
    temp.next = new LinkListNode(i)
    temp = temp.next
  }
  return root
}


function reverse(root: LinkListNode) {
  let temp = root, temp2: LinkListNode
  while (true) {
    if (temp.next === null) return temp
    temp2 = temp

    temp = temp.next
  }
}



function travelLinkList(root: LinkListNode) {
  console.log(root.value)
  root.next && travelLinkList(root.next)

  // let temp = root
  // console.time('a')
  // while (true) {
  //   console.log(temp.value)
  //   if (temp.next === null) break
  //   temp = temp.next
  // }
  // console.timeEnd('a')
}

travelLinkList(createLinkList(4))

let ws = new WritableStream({}, {
  size: (ck) => 124
})

