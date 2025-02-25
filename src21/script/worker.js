self.onmessage = function (e) {
  console.log('Message received from main script,data:',e.data)
  console.log('Posting message back to main script')


  const val = test(e.data)
  // console.log('val',val)

  self.postMessage(' from worker,test() result:' + val)
}

function test(n = 1000000) {
  let start = Date.now(),i = 0,val

  while (Date.now() - start < 2000) {
    //do nothing
    if (i > n) i = 0
    val = i++ % 1000
  }
  return val
}
