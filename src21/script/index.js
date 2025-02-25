// const worker = new Worker('./script/worker.js')

// worker.onmessage = function (e) {
//   console.log('worker message',e.data)
// }
// worker.postMessage(100000)


// fetch('c://Users/xue647464/Pictures/壁纸/xue.png').then(r => {

//   console.log('r',r)

// })

// new Blob([])

/**@type {HTMLCanvasElement} */
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')


/**@type {HTMLVideoElement} */
const video = document.getElementById('video')
const ipt = document.getElementById('ipt')


ipt.oninput = e => {
  console.log(e.target.value)
  const p = e.target.value / 100
  video.currentTime = p * video.duration
  ctx.drawImage(video,100,100)

}









// ctx.moveTo(100,100)

