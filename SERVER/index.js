const { app,ws_app } = require('./app.js')
const router = require('./router/index.js')
require('./routes/index.js')

router.init(app)


