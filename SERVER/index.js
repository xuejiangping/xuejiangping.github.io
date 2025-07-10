const { app,ws_app } = require('./app.js')
const path = require('path')
const { http_router,ws_router } = require('./router/index.js')
require('./routes/index.js')
// http_router.init({ app,staticFileDir: path.join(__dirname,'cert') })
http_router.init({ app,staticFileDir: 'd://' })

ws_router.init({ app: ws_app,basePath: '/ws' })