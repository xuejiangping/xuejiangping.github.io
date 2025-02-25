const sharedWorker = new SharedWorker('script/myworker.js');
const port = sharedWorker.port;

port.onmessage = function (event) {
    console.log('Received from shared worker in main1:',event.data);
};

port.postMessage('Hello SharedWorker from main1');

