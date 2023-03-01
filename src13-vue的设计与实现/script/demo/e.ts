const watcher = (): ClassDecorator => {
  return (t: Function) => {
    console.log(t)
    t.prototype.say = function () { console.log(123) }
  }
}

@watcher()
class A {
}

let a = new A();
(<any>a).say()