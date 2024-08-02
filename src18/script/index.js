class A {
  constructor() {
    A.nums++


  }
  static nums = 0
  #aa = 22
  bb = 33
}


// Array(5).fill().forEach(() => new A())
let a = new A()
debugger
// const fs = require('fs')
// const path = require('path')