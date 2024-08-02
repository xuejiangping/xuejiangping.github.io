import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({

  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '2280614885@qq.com',
    pass: 'tnkvxcucfattdigh',
  }
})

function sendMail(text = '1112222',subject = 'nodemailer测试',to = '1127523185@qq.com') {
  transporter.sendMail({
    to,// list of receivers
    from: transporter.options.auth.user,
    text,
    subject,
  }).then(r => {
    console.log('发送成功：',transporter.options.auth.user)
  }).catch(err => {
    console.log('发送失败：',err)
  })
}

sendMail()
let i = 0

setInterval(() => {
  sendMail(new Date().toLocaleString(),'定时发送测试' + i)
},5000);




// export default transporter