
const d_a: MethodDecorator = function (t, p, d) {
  console.log('d_a d.value', d.value)
  d.value = function xx(...args: any[]) {

  } as typeof d.value
}



const d_b: MethodDecorator = function (t, p, d) {

  console.log('d_b d.value', d.value)
}


class A {
  @d_b
  @d_a
  say() {
    console.log('hello')
  }
}

debugger