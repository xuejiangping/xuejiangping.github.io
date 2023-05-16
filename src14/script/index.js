

// 记录弹幕
(function () {

  const asleep = t => new Promise(res => setTimeout(res,t))
  const log = (i => (msg) => console.log(`[${new Date().toLocaleString()}] :`,msg,++i))(0)
  const t = 3000
  danmu()
  async function danmu() {
    await asleep(t)
    const el = findElement('#chat-history-list #chat-items')
    if (!el) {
      log('找不到弹幕列表')
    }
    const arr = window.danmuList = []
    const baseUrl = 'http://localhost:9000/danmu?data='

    const observerOptions = {
      childList: true
    }
    const cb = (records) => {
      let danmuArr = []
      records[0].addedNodes.forEach(({ uname,danmaku }) => {
        danmuArr.push({ uname,danmaku })
      })
      arr.push(danmuArr)
      let url = baseUrl + JSON.stringify(danmuArr)
      fetch(url)
    }

    const ob = new MutationObserver(cb)
    ob.observe(el,observerOptions)
  }

})();



// 记录 B站直播SC
(function () {
  const findElement = ((lastDoc,frames) => {
    return function (selectors,isAll = false) {
      let res,doc
      if (lastDoc) {
        if (isAll) {
          res = lastDoc.querySelectorAll(selectors)
          if (res.length > 0) return res
        } else {
          res = lastDoc.querySelector(selectors)
          if (res) return res
        }
      }
      for (let i = 0; i < frames.length; i++) {
        try {
          doc = frames[i].document
        } catch (error) {
          continue
        }
        if (isAll) {
          res = doc.querySelectorAll(selectors)
          if (res.length > 0) {
            lastDoc = doc
            return res
          }
        } else {
          res = doc.querySelector(selectors)
          if (res) {
            lastDoc = doc
            return res
          }
        }
      }
      console.log('未找到元素',selectors)
    }
  })(window.document,window.frames);

  const log = (...msg) => console.log(`[${new Date().toLocaleTimeString()}]:`,...msg)
  const cb_test = obj => { log('新SC',obj); saveSC(obj) }
  const asleep = (t) => new Promise(res => setTimeout(res,t))
  const panel_vm = findElement('#pay-note-panel-vm')
  if (!panel_vm) return log('findElement 未找到元素 #pay-note-panel-vm')
  start()
  const Panel_Vm_OB = new MutationObserver(records => {
    const childListRecord = records.find(v => v.type === 'childList')
    // console.log('childListRecord',childListRecord)
    if (childListRecord.removedNodes.length > 0) {
      log('SC 面板消失')
    }
    if (childListRecord.addedNodes.length > 0) {
      const isNew = [...childListRecord.addedNodes].some(addedNode => addedNode.classList.contains('pay-note-panel'))
      if (isNew) {
        log('SC 面板出现')
        start()
      }

    }
  })
  Panel_Vm_OB.observe(panel_vm,{ childList: true })

  function start() {
    const panel = panel_vm.querySelector('.pay-note-panel')
    if (panel) {
      getCurrentSc(panel,cb_test)
      //开始监听 .card-list .card-wrapper
      const SC_Wrapper = panel.querySelector('.card-list .card-wrapper')
      const SC_Wrapper_OB = new MutationObserver(records => {
        const childListRecord = records.find(v => v.type === 'childList')
        childListRecord.addedNodes.forEach(addedNode => {
          getCardInfo(addedNode,panel,cb_test)
        })
      })
      SC_Wrapper_OB.observe(SC_Wrapper,{ childList: true })
    } else {
      // 若没有panel 监听 #pay-note-panel-vm
      log('当前没有SC panel,监听 #pay-note-panel-vm 。。。')
    }
  }
  async function getCurrentSc(panel,cb) {
    const cardList = panel.querySelectorAll('.card-item')
    for await (let card of generator(cardList,1000)) {
      getCardInfo(card,panel,cb)
    }
  }
  function* generator(arr = [],t = 500) {
    for (let i = 0; i < arr.length; i++) {
      yield new Promise(res => setTimeout(res,t,arr[i]))
    }
  }
  async function getCardInfo(card,panel,cb) {
    card.click()
    await asleep(300)
    let obj = {
      name: panel.querySelector('.detail-info .name')?.textContent,
      price: panel.querySelector('.detail-info .price')?.textContent,
      text: panel.querySelector('.detail-info .text')?.textContent
    }
    cb(obj)
    card.click()
    await asleep(300)
  }
  function saveSC(obj) {
    let data = localStorage.getItem('SC')
    if (data === null) {
      data = [obj]
    } else {
      data = JSON.parse(data)
      data.push(obj)
    }
    localStorage.setItem('SC',JSON.stringify(data))
  }
})()

