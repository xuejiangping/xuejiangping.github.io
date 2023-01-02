const url = '../../src2-歌词滚动/assets/六月的雨.mp3'

class AudioDemo1 {
  constructor() {
    this.audCtx = new AudioContext()
    this.sourceNode = this.audCtx.createBufferSource()
    this.gainNode = this.audCtx.createGain()

  }

  async decode(buffer) {
    return await this.audCtx.decodeAudioData(buffer)
  }
  async start(url) {
    const buffer = await this.fetchAudioArrayBuffer(url)
    const audioBuffer = await this.decode(buffer)
    this.play(audioBuffer)
  }
  async play(audioBuffer) {
    const { sourceNode } = this
    sourceNode.buffer = audioBuffer
    sourceNode.connect(this.gainNode).connect(this.audCtx.destination)
    this.gainNode.gain.value = 0.1
    sourceNode.start(0)

  }
  async fetchAudioArrayBuffer(ulr) {
    const res = await fetch(ulr)
    return await res.arrayBuffer()
  }


  // debugger
}
let demo = new AudioDemo1()
demo.start(url)
window.demo = demo

