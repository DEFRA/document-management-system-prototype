const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
require('./routes/0.js')(router)
require('./routes/1.js')(router)

module.exports = router
