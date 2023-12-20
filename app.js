const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4111
const cron = require("node-cron")
require('dotenv').config()

app.use(bodyParser.json())
//DISABLING CORS (ONLY FOR DEV)
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use("/", require("./router"))

app.listen(PORT, console.log("Server start for port: " + PORT))

const { cronjob } = require("./controllers/cronController")
cron.schedule("0 21 * * *", cronjob)
// cron.schedule("0 * * * * *", tes)