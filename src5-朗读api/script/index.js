const synth = window.speechSynthesis
const voiceSelect = document.getElementById('voiceSelect')
const utterThis = new SpeechSynthesisUtterance()

const btn = document.getElementById('btn')
const textIpt = document.getElementById('textIpt')
let voices = []


function addVoiceList() {
  const voicesFragment = document.createDocumentFragment()
  voices = synth.getVoices()
  let v = voices.reduce((t,v) => (t[v.lang] ? t[v.lang].push(v) : t[v.lang] = [v],t),{})
  for (const k in v) {
    let optgroup = document.createElement('optgroup')
    optgroup.label = k
    v[k].forEach(v => {
      let option = document.createElement('option')
      option.textContent = v.name
      optgroup.appendChild(option)
    })
    voicesFragment.appendChild(optgroup)
  }
  voiceSelect.appendChild(voicesFragment)
}


voiceSelect.onchange = function () {
  console.log(this.value)
  const voiceIndex = this.selectedIndex
  utterThis.voice = voices.find(v => v.name === this.value)

}

function speech() {
  synth.cancel()
  utterThis.text = textIpt.value
  synth.speak(utterThis)
}
btn.onclick = speech

// synth.onvoiceschanged = function (e) {
//   console.log('utterThis.voice',utterThis.voice)
// }
setTimeout(() => {
  addVoiceList()
},100);