const Client = require('@line/bot-sdk').Client;

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
})

const webhook = (req, res) => {
    const event = req.body.events[0];

    if(event.type === 'message'){
        if(event.source.type == "group"){
            
        } else {
            const message = event.message
            client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'hai'
            })
        }
    }
    res.json({
        "status": 0
    })
}

const sendMessage = (userId, message) => {
    client.pushMessage(userId, { type: 'text', text: message });
}

module.exports = {
    webhook,
    sendMessage
}