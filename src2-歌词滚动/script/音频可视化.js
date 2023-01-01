const defaultOptions = {
  fillStyle: 'red',
  fftSize: 128,

}
/**
 * 绘制音频图谱
 * @param {HTMLAudioElement|AudioContext} origin AudioContext 的源，可以是音频元素或者 媒体流
 * @param {HTMLCanvasElement} cvs 用于绘制音频谱的canvas 元素 
 */
function start(origin,cvs,options = defaultOptions) {
  const { width,height } = cvs
  console.log(width,height)
  let animationId,mediaStream = options.mediaStream
  const ctx = cvs.getContext('2d')
  // ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = options.fillStyle
  const audioCtx = new AudioContext()
  let source,destination
  if (origin instanceof Audio) {
    source = audioCtx.createMediaElementSource(origin);
    destination = audioCtx.destination
  } else if (origin instanceof MediaStream) {
    source = audioCtx.createMediaStreamSource(mediaStream)
    destination = audioCtx.createMediaStreamDestination()
  }
  const gainNode = audioCtx.createGain()
  const analyser = audioCtx.createAnalyser()
  source.connect(gainNode).connect(analyser).connect(destination)
  analyser.fftSize = options.fftSize
  const bufferLength = analyser.frequencyBinCount
  const dataArr = new Uint8Array(bufferLength)
  const columnWidth = width / (bufferLength * 2)

  // 开始绘制图谱动画
  function run() {
    animationId = window.requestAnimationFrame(run)
    analyser.getByteFrequencyData(dataArr)
    drawGraph(concatTypedArray(dataArr.slice().reverse(),dataArr))
  }
  // 合并两个类型数组，用于将音频图谱数组
  function concatTypedArray(arr1,arr2) {
    let newArr = new Uint8Array(arr1.length + arr2.length)
    newArr.set(arr1)
    newArr.set(arr2,arr1.length)
    return newArr
  }
  //绘图函数
  function drawGraph(arr) {
    ctx.clearRect(0,0,width,height)
    arr.forEach((v,i) => {
      ctx.fillRect(columnWidth * i,0,columnWidth + 1,(v / 255) * height)
    })

  }
  /**
   * 开始图谱绘制
   */
  function resume() {
    audioCtx.resume().then(run)
  }
  /**
   * 暂停 图谱绘制
   */
  function supend() {
    audioCtx.suspend().then(() => {
      animationId && window.cancelAnimationFrame(animationId)
    })

  }
  return {
    resume,
    supend
  }

}
export default start
