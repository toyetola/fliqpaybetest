const express = require('express');
const app = express()
const routes = require('./routes/route')
const bodyParser = require('body-parser')

// Middlewares...
// Routes...
process.env.MODE = "test"
app.use(bodyParser.json())
app.use('/', routes);

module.exports = app