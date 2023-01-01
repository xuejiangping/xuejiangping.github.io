
const palyBtn = document.getElementById('playBtn')
const audioEl = document.getElementById('audioEl')
const cvs = document.getElementById('cvs')
// audioEl.src = './assets/剑伤.mp3'
const { width,height } = cvs

/**
 * 
 * @param {HTMLCanvasElement} cvs 
 * @param {HTMLAudioElement} audioEl 
 */
function start(audioEl,cvs,mediaStream) {
  let animationId
  const ctx = cvs.getContext('2d')
  ctx.fillStyle = 'red'
  const audioCtx = new AudioContext()
  const source = mediaStream ?
    audioCtx.createMediaStreamSource(mediaStream) :
    audioCtx.createMediaElementSource(audioEl);
  const gainNode = audioCtx.createGain()
  const analyser = audioCtx.createAnalyser()
  // audioCtx.createMediaStreamDestination()
  source.connect(gainNode).connect(analyser)
  // .connect(mediaStream ? audioCtx.createMediaStreamDestination() : audioCtx.destination)
  analyser.fftSize = 64

  const bufferLength = analyser.frequencyBinCount
  const dataArr = new Uint8Array(bufferLength)
  const columnWidth = width / (bufferLength * 2)

  function run() {
    animationId = window.requestAnimationFrame(run)
    analyser.getByteFrequencyData(dataArr)

    drawGraph(concatTypedArray(dataArr.slice().reverse(),dataArr))
  }

  function concatTypedArray(arr1,arr2) {
    let newArr = new Uint8Array(arr1.length + arr2.length)
    newArr.set(arr1)
    newArr.set(arr2,arr1.length)
    return newArr
  }

  function drawGraph(arr) {
    ctx.clearRect(0,0,width,height)
    arr.forEach((v,i) => {
      ctx.fillRect(columnWidth * i,0,columnWidth + 1,(v / 255) * height)
    })

  }

  palyBtn.onclick = function () {
    if (audioEl.paused) {
      audioCtx.resume().then(run)
      // if (audioCtx.state === 'suspended') {
      //   audioCtx.resume().then(run)
      // }
      audioEl.play()
    } else {
      audioEl.pause()
      animationId && window.cancelAnimationFrame(animationId)
    }
  }
}
function a() {
  window.navigator.mediaDevices.getDisplayMedia({ audio: true })
    .then(mediaStream => {
      // audioEl.srcObject = mediaStream
      start(audioEl,cvs,mediaStream)
    }).catch(err => console.log(err))
}
// a()
// start(audioEl,cvs)