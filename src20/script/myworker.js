// sharedWorker.js

const clients = [];
/**
 * @param {MessageEvent} event
 */
onconnect = function (event) {
  const port = event.ports[0];
  clients.push(port)

  clients.forEach(client => client.postMessage(`新连接！！！,当前连接数：${clients.length}`));





  port.onmessage = function (event) {
    console.log('Received:',event.data);
    clients.forEach(client => client.postMessage('Echo: ' + event.data));
  };

  port.start(); // Required to start handling messages  
};

console.log('999',999)