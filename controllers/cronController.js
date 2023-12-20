const cron = require("node-cron")
const request = require('request')
const async_query = require("../models/async.js")

//check follow-up
const cronjob = async () => {

    let [rows, fields] = await async_query(
        "SELECT * FROM regis_pelayanan WHERE follow_up = 0",
        []
    )

    request.post({
        url: "https://dev.api.jtcprj.org/linebot/send-message",
        json: {
            "userId": "Ca196abd5ac8b1d56835f3c73a8cc0fba",
            "message": JSON.stringify(rows),
            "token": "Chrystal@12"
        }
    }, (error, response, body) => {
        console.log(body)
    })
}

module.exports = {
    cronjob
}