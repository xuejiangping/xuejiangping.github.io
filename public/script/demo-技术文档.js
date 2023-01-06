
async function getData() {
  let value = await fetch('http://localhost:5500/public/assets/demo-技术文档.json').then(r => r.json())
  let data = JSON.parse(value)
  let { head,body } = generateTemplate(data)
  document.querySelector('#navbar ul').innerHTML = head
  document.getElementById('main-doc').innerHTML = body
}
getData()

function generateTemplate(data) {

  return data.reduce((t,{ title: id,p,li }) => {
    let title = id.replaceAll('_',' ')
    t.head += `<li><a class="nav-link" href="#${id}">${title}</a></li>`
    t.body += `
    <section class="main-section" id="${id}">
        <header class="header">${title}</header>
        <article>
        ${p.reduce((t,[k,v]) => t + k === 'P' ? `<p class="article">${v}</p>` : `<code>${v}</code>`,'')}
          <ul>
        ${li.reduce((t,v) => t + `<li class="item">${v}</li>`,'')}
          </ul>
        </article>
   </section>
  `
    return t
  },{ head: '',body: '' })

}
console.log(99999)