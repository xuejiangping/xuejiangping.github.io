// const child_process = require('child_process');

const path = require('path');
const { Worker } = require('worker_threads');
const filePath = path.join(__dirname,'./train.js')

function startMultithreading(num) {

  for (let i = 1; i <= num; i++) {

    new Worker(filePath,{ argv: [i] })

  }

}

startMultithreading(1)