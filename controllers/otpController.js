const async_query = require("../models/async.js")
const mail = require("./mailController.js")


const requestOTPEmail = async (data) => {
    //create value otp
    otp = Math.floor(100000 + Math.random() * 900000)
    let [rows, fields] = await async_query(
        "INSERT INTO otp (data, value) VALUES (?,?)",
        [data, otp]
    )

    //send email
    let sendmail = await mail.mail({
        to: data,
        subject: "[JTCPRJ] OTP VERIFICATION",
        html: `<p>Kode OTP kamu: <h3>${otp}</h3></p>`
    })

    return [sendmail, otp]
}

module.exports = {
    requestOTPEmail
}