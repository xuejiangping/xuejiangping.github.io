const btn = document.getElementById('file')
const url = 'http://localhost:9000/uploadFile'
btn.onchange = function (e) {
  const files = e.target.files
  console.log('e.target',files)
  const fm = new FormData()
  Object.values(files).forEach(v => fm.append(v.name,v))
  console.log('fm',fm)
  fetch(url,{
    method: 'post',body: fm,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
    .then(res => res.text())
    .then(console.log)
}