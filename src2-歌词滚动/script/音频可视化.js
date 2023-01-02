const defaultOptions = {
  fillStyle: 'red',
  fftSize: 128,

}
/**
 * 绘制音频图谱
 * @param {HTMLAudioElement|AudioContext} origin AudioContext 的源，可以是音频元素或者 媒体流
 * @param {CanvasRenderingContext2D} ctx 用于绘制音频谱的canvas 上下文
 */
function start(origin,ctx,options = defaultOptions) {
  const { width,height } = ctx.canvas
  let animationId,mediaStream = options.mediaStream
  ctx.fillStyle = options.fillStyle
  /**
   * @constructor AudioContext
   * 可选参数latencyHint值有 3 个，一般使用默认值即可
   * balanced 平衡音频输出延迟和资源消耗
   * inteactive 默认值 提供最小的音频输出延迟最好没有干扰
   * playback 对比音频输出延迟，优先重放不被中断
   */
  const audioCtx = new AudioContext()
  //destination是一个特殊的AudioNode，它代表处理完成后的声音播放的出口，也是AudioContext存在的必要，所以在创建AudioContext时已创建好了，可以直接通过audioContext.destination来获得
  let source,destination
  if (origin instanceof Audio) {
    source = audioCtx.createMediaElementSource(origin);
    destination = audioCtx.destination
  } else if (origin instanceof MediaStream) {
    source = audioCtx.createMediaStreamSource(mediaStream)
    // destination = audioCtx.createMediaStreamDestination()
  } else throw Error('origin 必须是音频元素 或者 媒体流')
  const gainNode = audioCtx.createGain()
  const analyser = audioCtx.createAnalyser()
  source.connect(gainNode).connect(analyser).connect(destination)
  //fftSize：fft是快速傅里叶变换，fftSize就是样本的窗口大小。
  analyser.fftSize = options.fftSize
  //frequencyBinCount(readOnly)：其值为fftSize的一半，作用是以此为bufferLength创建一个Unit8Array的实例，然后将音频的时域或者频域的数据拷贝进去
  const bufferLength = analyser.frequencyBinCount
  const dataArr = new Uint8Array(bufferLength)   //存放频域
  const dataArr2 = new Uint8Array(bufferLength)  //存放时域
  // console.log('analyser.fftSize',analyser.fftSize)
  // console.log('bufferLength',bufferLength)
  // 开始绘制图谱动画
  function run() {
    /**
     * 获取 时域 和 频域 的方法分别为
     * getByteTimeDomainData
     * getByteFrequencyData
     */
    animationId = window.requestAnimationFrame(run)
    analyser.getByteFrequencyData(dataArr)
    analyser.getByteTimeDomainData(dataArr2)
    // let arr = concatTypedArray(dataArr.slice().reverse(),dataArr)
    ctx.clearRect(0,0,width,height)
    // drawMethods.columnGraph(dataArr)
    drawMethods.default(dataArr)
    // drawGraph(concatTypedArray(dataArr.slice().reverse(),dataArr))
  }
  // 合并两个类型数组，用于将音频图谱数组
  function concatTypedArray(arr1,arr2) {
    let newArr = new Uint8Array(arr1.length + arr2.length)
    newArr.set(arr1)
    newArr.set(arr2,arr1.length)
    return newArr
  }
  //绘图函数
  const drawMethods = {
    default: null,
    columnGraph: (function () {
      const columnWidth = width / analyser.fftSize
      // const columnWidth = width / analyser.frequencyBinCount
      return () => {
        let arr = concatTypedArray(dataArr.slice().reverse(),dataArr)
        arr.forEach((v,i) => {
          let x = columnWidth * i,y = 0,w = columnWidth + 1,h = (v / 255) * height
          ctx.fillRect(x,y,w,h)
        })

      }
    })(),
    lineGraph: (function () {
      let x = 0,step = 0.5,index = Math.floor(analyser.frequencyBinCount / 2)
      let length = analyser.frequencyBinCount
      return (arr) => {
        // let y = (arr[index] / 255) * height
        // console.log(x,y)
        // ctx.lineTo(x += step,y)
        // ctx.stroke()
        ctx.beginPath()
        arr.forEach((v,i) => {
          let y = (v / 255) * height
          let x = i * width / length
          ctx.lineTo(x,y)
          ctx.stroke()

        })

      }
    })()
  }
  drawMethods.default = drawMethods.columnGraph

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
    resume,audioCtx,
    supend,gainNode,drawMethods
  }

}
export default start

