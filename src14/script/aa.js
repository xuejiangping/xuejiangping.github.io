
import * as tf from '@tensorflow/tfjs'
window.tf = tf

// 创建数据
const IMAGES_SPRITE_PATH = '../assets/mnist_images.png'
const LABELS_PATH = '../assets/mnist_labels_uint8'
const MODEL_SAVE_PATH = 'localstorage://my-model-1'
const IMAGE_H = 28;
const IMAGE_W = 28;
const NUM_CLASSES = 10
// const IMAGE_SIZE = IMAGE_H * IMAGE_W;

const chunk = 15000
const P_TRAIN = 0.2

const log = (...args) => console.log(`[${new Date().toLocaleTimeString()}]: `,...args)
class MnistData {
  async load() {
    const cvs = document.createElement('canvas')
    // const cvs = document.getElementById('cvs')
    const ctx = cvs.getContext('2d')
    const img = new Image()

    const fetchLabels = fetch(LABELS_PATH)
    const loadImg = new Promise(res => {
      img.onload = function () {
        img.width = img.naturalWidth
        img.height = img.naturalHeight
        cvs.width = img.width
        cvs.height = chunk
        ctx.drawImage(img,0,0,cvs.width,chunk,0,0,cvs.width,chunk)
        res()
      }
      img.src = IMAGES_SPRITE_PATH
    })

    const [labelsResponse] = await Promise.all([fetchLabels,loadImg])
    const lablesUintArray = new Uint8Array(await labelsResponse.arrayBuffer()).slice(0,chunk * NUM_CLASSES)
    this.trainLables = tf.tensor2d(lablesUintArray,[chunk,NUM_CLASSES])

    // this.trainImg = tf.browser.fromPixels(cvs,3).reshape([chunk,IMAGE_W,IMAGE_H,3]).mean(3).reshape([chunk,IMAGE_W,IMAGE_H,1]).div(255)

    this.trainImg = tf.browser.fromPixels(cvs,1).reshape([chunk,IMAGE_W,IMAGE_H,1]).div(255)
  }

  getTrainData() {
    const nums = chunk * P_TRAIN
    const xs = this.trainImg.slice(0,nums)
    const lables = this.trainLables.slice(0,nums)
    return { xs,lables }
  }
  getTestData(numExamples,raw) {
    const nums = chunk * P_TRAIN
    let xs,lables
    if (numExamples != null) {
      xs = this.trainImg.slice([0,0,0,0],[numExamples,IMAGE_H,IMAGE_W,1])
      lables = this.trainLables.slice([0,0],[numExamples,NUM_CLASSES]);
    } else {
      xs = this.trainImg.slice(nums)
      lables = this.trainLables.slice(nums)
    }
    return { xs,lables }
  }
  /**
   * 
   * @param {{xs:tf.Tensor,lables:tf.Tensor}} param0 
   */
  async validate({ xs,lables }) {
    const cvs = document.createElement('canvas')
    const tag = document.createElement('div')
    let i = 0
    document.body.append(cvs,tag)
    const xs_arr = await xs.array()
    console.log('xs_arr',xs,xs_arr)
    setInterval(async () => {
      await tf.browser.toPixels(tf.tensor(xs_arr[i]),cvs)
      tag.textContent = lables.gather([i],0).reshape([10]).argMax()
      i++
    },1000)
  }
}


//创建模型
function createConvModel() {
  const model = tf.sequential()
  //=================================================
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_H,IMAGE_H,1],
    kernelSize: 3,
    filters: 32,
    activation: 'relu'
  }))
  model.add(tf.layers.conv2d({
    kernelSize: 3,
    filters: 32,
    activation: 'relu'
  }))
  model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
  }))
  //=================================================

  model.add(tf.layers.conv2d({
    kernelSize: 3,
    filters: 64,
    activation: 'relu'
  }))
  model.add(tf.layers.conv2d({
    kernelSize: 3,
    filters: 64,
    activation: 'relu'
  }))
  model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
  }))

  model.add(tf.layers.flatten())

  //=================================================
  model.add(tf.layers.dropout({ rate: 0.5 }))
  //=================================================

  model.add(tf.layers.dense({
    units: 512,
    activation: 'relu'
  }))
  //=================================================
  model.add(tf.layers.dropout({ rate: 0.5 }))
  //=================================================
  model.add(tf.layers.dense({
    units: 10,
    activation: 'softmax'
  }))
  // model.summary()
  return model
}

async function train(epochs = 3) {
  log('开始训练,总轮次：',epochs)

  const model = createConvModel()
  model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: 'rmsprop',
    metrics: ['accuracy']
  })

  const trainData = mnistData.getTrainData()
  const testData = mnistData.getTestData()

  await model.fit(trainData.xs,trainData.lables,{
    epochs,batchSize: 64,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd(epoch,{ acc,loss }) {
        console.log('epoch',epoch)
        console.table({ loss,acc })
      }

    }
  })

  const testResult = model.evaluate(testData.xs,testData.lables)
  const [testDataLoss,testDataAcc] = testResult.map(v => v.dataSync()[0])
  log('测试模型结束 :','\n测试集损失',testDataLoss,'\n测试集准确率',testDataAcc)

  saveModel(model,{ loss: testDataLoss,acc: testDataAcc })
}

function saveModel(model,testLogs) {
  const lastLogs = JSON.parse(localStorage.getItem('testLogs'))
  if (!lastLogs || lastLogs.acc < testLogs.acc) {
    localStorage.setItem('testLogs',JSON.stringify(testLogs))
    model.save(MODEL_SAVE_PATH)
      .then(() => log('更新模型'))
      .catch(err => log('保存模型出错',err))
  }

}
/**
 * 
 * @param {tf.Sequential} model 
 */
async function predict({ xs,lables },testModel) {
  const model = testModel || await tf.loadLayersModel(MODEL_SAVE_PATH)

  // const { xs,lables } = mnistData.getTestData(10)
  tf.browser.toPixels(xs.reshape([IMAGE_W,IMAGE_W,1]),cvs2)
  const res = model.predict(xs)

  let predictions = Array.from(res.argMax(1).dataSync())
  console.log('predictions',predictions)

  if (lables) {
    let answer = Array.from(lables.argMax(1).dataSync())
    console.log('answer',answer)
  }
  return Promise.resolve(predictions)
}

//==========================================================================================
const mnistData = new MnistData()

init()

function init() {
  let model
  tf.loadLayersModel(MODEL_SAVE_PATH).then(m => model = m).catch(err => console.log('加载本地模型出错',err))
  window.mnistData = mnistData

  const clearBtn = document.getElementById('clear')
  const predictBtn = document.getElementById('btn')
  const showBox = document.getElementById('show')

  const startTrainBtn = document.getElementById('startTrain')
  /**@type {HTMLCanvasElement}*/
  const cvs = document.getElementById('cvs')
  const ctx = cvs.getContext('2d')

  ctx.strokeStyle = '#fff'
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round'
  ctx.lineWidth = 30
  createPalette(cvs,ctx)
  clearScreen()
  //清屏
  clearBtn.onclick = clearScreen
  predictBtn.onclick = function () {
    let img = tf.browser.fromPixels(cvs,3)
    let xs = tf.image.resizeNearestNeighbor(img,[IMAGE_W,IMAGE_H]).mean(2).reshape([1,28,28,1]).div(255)
    predict({ xs },model).then(val => showBox.textContent = val)
  }


  startTrainBtn.onclick = function () {
    log('开始加载训练数据')
    mnistData.load().then(async () => {
      // mnistData.validate(mnistData.getTestData(100,true))
      train(50)

    })
  }
  function createPalette(cvs,ctx) {
    cvs.onmousedown = function ({ offsetX,offsetY }) {
      ctx.beginPath();
      ctx.moveTo(offsetX,offsetY);
      cvs.onmousemove = function ({ offsetX,offsetY }) {
        ctx.lineTo(offsetX,offsetY);
        ctx.stroke();
      };
      cvs.onmouseleave = end;
      cvs.onmouseup = end;
      function end() {
        cvs.onmousemove = null;
        cvs.onmouseup = null;
        cvs.onmouseleave = null;
      }
    };
  }
  function clearScreen() {
    ctx.save()
    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,cvs.width,cvs.height)
    ctx.restore()

  }
}


