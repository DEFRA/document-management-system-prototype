const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
require('./routes/RC1.js')(router)
require('./routes/0.js')(router)
require('./routes/1.js')(router)
require('./routes/2.js')(router)
require('./routes/3.js')(router)
require('./routes/4.js')(router)
require('./routes/5.js')(router)
require('./routes/6.js')(router)
require('./routes/7.js')(router)
require('./routes/8.js')(router)
require('./routes/9.js')(router)

module.exports = router
