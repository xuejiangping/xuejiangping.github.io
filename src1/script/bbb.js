// <![CDATA[  <-- For SVG support
if ('WebSocket' in window) {
  (function () {
    function refreshCSS() {
      //刷新 css 样式表，将所有原样式表添加  _cacheOverride=时间戳 
      var sheets = [].slice.call(document.getElementsByTagName("link"));
      var head = document.getElementsByTagName("head")[0];
      for (var i = 0; i < sheets.length; ++i) {
        var elem = sheets[i];
        var parent = elem.parentElement || head;
        parent.removeChild(elem);
        var rel = elem.rel;
        if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
          //  将css样式表的href中的 _cacheOverride= 的查询参数去掉
          var url = elem.href.replace(/(&|\\?)_cacheOverride=\\d+/,'');
          // 添加 _cacheOverride=时间戳
          elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
        }
        parent.appendChild(elem);
      }
    }
    //根据当前地址的http 协议 选择 websocket 协议
    var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
    var address = protocol + window.location.host + window.location.pathname + '/ws';
    var socket = new WebSocket(address);
    socket.onmessage = function (msg) {
      if (msg.data == 'reload') window.location.reload();

      else if (msg.data == 'refreshcss') refreshCSS();
    };
    if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
      console.log('Live reload enabled.');
      sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer',true);
    }
  })();
} else {
  console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
} 