const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const port  = process.env.PORT || 5000
const bodyParser = require('body-parser')
const autMiddleware = require('./middleware/auth')
const routes = require('./routes/route')
const path = require('path')

require("dotenv").config();
/* {
    path: path.join(__dirname, "./.env")
} */


const app = express()

const dburl = process.env.MODE == "dev" ? process.env.DB_URI : process.env.DB_URI_TEST

mongoose
    .connect(dburl)
    .then(() => {
        console.log('Connected to the Database successfully');
    })
    .catch( (err) => {
        console.log('Error connecting to database')
    });

// app.use(cors)
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended:true}));


app.use('/', routes);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

module.exports = app