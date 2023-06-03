const tf = require('@tensorflow/tfjs-node')


const a1 = tf.tensor2d([[0.2,0.5,0.4]],[1,3],'float32')


const myModel = () => {
  const layer1 = tf.layers.dense({ activation: 'sigmoid',units: 3,inputShape: [1,2] })
  const layer2 = tf.layers.dense({ activation: 'sigmoid',units: 2,inputShape: [1,3] })
  const model = tf.sequential({ layers: [layer1,layer2] })
  model.compile()

}


/**
 * 实现 dense函数 功能,参数中的数组都是 numjs 数组，非js原生数组
 * @param {*} a_in 上层的输入
 * @param {w[][]} W 该层神经网络的v_w
 * @param {b[]} B 该层神经网络的 因子b
 * @param {sigmoidFN} g 激活函数
 */
function myDense(a_in,W,B,g) {
  let z = W.dot(a_in.T).add(B)
  return g(z)
}