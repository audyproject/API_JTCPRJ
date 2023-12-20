const Client = require('@line/bot-sdk').Client;
const { HTTPError } = require('@line/bot-sdk');
const async_query = require("../models/async.js")

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
});

const index = (req, res) => {
    res.json({
        "status_code": 0,
        "message": "success"
    })
}

const errorHandling = () => {

}

const webhook = async (req, res) => {
    if(req.body.events.length == 0){
        res.json({
            "status_code": 0,
            "message": "success"
        })
        return
    }
    
    const event = req.body.events[0]

    if(event.type === "message"){
        const message = event.message
        let msg = message.text.split(" ")

        // client.replyMessage(event.replyToken, {
        //     type: 'text',
        //     text: JSON.stringify(event)
        // })
        // return

        if(message.type == "text"){
            if(event.source.type === "group"){
                if(msg[0] == "/register"){
                    let [rows, fields] = await async_query(
                        "INSERT INTO line_user (userId, type, alias) VALUES (?,?,?)",
                        [event.source.groupId, "group", msg[1]]
                    )
                    
                    //check if sql error
                    if(fields == -1){
                        let [rows1, fields1] = await async_query("SELECT * FROM line_user WHERE alias=? OR userId=?", ['admin', event.source.groupId])
                        let admin = ""
                        let error = ""
                        if(rows1[0].alias == 'admin'){
                            admin = rows1[0].userId
                            error = `Sender Name: ${rows1[1].alias}\nSender Type: ${rows1[1].type}\n\nError Message: ${rows.message}`
                        } else {
                            admin = rows1[1].userId
                            error = `Sender Name: ${rows1[0].alias}\nSender Type: ${rows1[0].type}\n\nError Message: ${rows.message}`
                        }
                        //send error to admin via line
                        client.pushMessage(admin, {
                            type: 'text',
                            text: error
                        })
                        //reply error to user
                        client.replyMessage(event.replyToken, {
                            type: 'text',
                            text: "Error! Please contact Admin!"
                        })
                        res.json({
                            "status_code": 0,
                            "message": "Success"
                        })
                        return
                    } else {
                        client.replyMessage(event.replyToken, {
                            type: 'text',
                            text: JSON.stringify(rows)
                        })
                    }
                    
                } else {
                    // let [rows, fields] = await async_query(
                    //     "SELECT * FROM jemaat",
                    // )
                    // client.replyMessage(event.replyToken, {
                    //     type: 'text',
                    //     text: JSON.stringify(fields)
                    // })
                }
            } else {
                // let [rows, fields] = await async_query(
                //     "INSERT INTO line_user (userId, type, alias) VALUES (?,?,?)",
                //     [event.source.userId, "user", msg[1]]
                // )
                // client.replyMessage(event.replyToken, {
                //     type: "text",
                //     text: "hai"
                // })
            }
        }
    }

    res.json({
        "status_code": 0,
        "message": "Success"
    })
}

const sendMessage = async (req, res) => {
    let userId = ""
    if(req.body.userId){
        userId = req.body.userId
    } else if(req.body.line_name){
        let alias = req.body.line_name
        let [rows, fields] = await async_query("SELECT userId FROM line_user WHERE alias=?", [alias])
        if(fields == -1){
            res.json({
                "status_code": -1,
                "message": "Line User not found!"
            })
            return
        } else {
            userId = rows[0].userId
        }
    }
    let message = req.body.message
    let token = req.body.token

    if(token == process.env.LINE_TOKEN){
        client.pushMessage(userId, { type: 'text', text: message });
        res.json({
            "status_code": 0,
            "message": "Success"
        })
    } else {
        res.json({
            "status_code": -1,
            "message": "Error"
        })
    }
}

const sendCarousel = async (req, res) => {
    let userId = ""
    if(req.body.userId){
        userId = req.body.userId
    } else if(req.body.line_name){
        let alias = req.body.line_name
        let [rows, fields] = await async_query("SELECT userId FROM line_user WHERE alias=?", [alias])
        if(fields == -1){
            res.json({
                "status_code": -1,
                "message": "Line User not found!"
            })
            return
        } else {
            userId = rows[0].userId
        }
    }
    let data = req.body.data
    let token = req.body.token

    if(token == process.env.LINE_TOKEN){
        // client.pushMessage(userId, { type: 'text', text: "tes" });
        client.pushMessage(userId, { 
            "type": "template",
            "altText": "This is a buttons template",
            "template": {
                "type": "carousel",
                "columns": data
            }
        }).catch((err) => {
            if(err instanceof HTTPError){
                res.json(err)
                return
            } else {
                res.json(err)
                return
            }
        });
        res.json({
            "status_code": 0,
            "message": "Success"
        })
    } else {
        res.json({
            "status_code": -1,
            "message": "Error"
        })
    }
}

module.exports = {
    index,
    webhook,
    sendMessage,
    sendCarousel,
}