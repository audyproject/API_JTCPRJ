const async_query = require("../models/async.js")
const validator = require('validator')
const request = require('request')
const crypto = require('crypto')
const mail = require("./mailController.js")
const otp = require("./otpController.js")

const validate = (data) => {
    
    //name, type, value
    let returnData = {"status": 0}
    data.forEach(element => {
        // if(!element.value || validator.isEmpty(element.value) && element.empty == false){
        //     returnData.status = -1
        //     returnData.message = element.name + " is empty"
        //     return returnData
        // }
        if(!element.value && element.empty == true){
            return
        }
        if(!element.value && element.empty == false){
            returnData.status = -1
            returnData.message = element.name + " is empty"
            return returnData
        }
        element.value = element.value.toString()
        if(element.type == "alphaspace" && !validator.isAlpha(element.value, ['en-US'], {'ignore': ' '})){
            returnData.status = -1
            returnData.message = element.name + " is not alpha"
            return returnData
        } 
        if(element.type == "date" && !validator.isDate(element.value, {'delimiter': '-'})){
            returnData.status = -1
            returnData.message = element.name + " is not date format"
            return returnData
        }
        if(element.type == "numeric" && !validator.isNumeric(element.value)){
            returnData.status = -1
            returnData.message = element.name + " is not numeric"
            return returnData
        }
        if(element.type == "alpha" && !validator.isAlpha(element.value)){
            returnData.status = -1
            returnData.message = element.name + " is not alphabet"
            return returnData
        }
        if(element.type == "email" && !validator.isEmail(element.value)){
            returnData.status = -1
            returnData.message = element.name + " is not email"
            return returnData
        }
    })
    
    if(returnData.status != -1){
        returnData.message = "success"
    }
    return returnData
}

const requestOTP = async (req, res) => {
    let data = [
        {"name": "email", "type": "email", "empty": false, "value": req.body.email}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }
    
    let [rows, fields] = await async_query(
        "SELECT * FROM otp WHERE verify=0 AND TIMESTAMPDIFF(MINUTE, created_at, NOW())<5"
    )
    
    if(rows.length>2){
        res.json({
            "status_code": -1,
            "message": "Terlalu banyak request! Tunggu 5 menit atau gunakan OTP sebelumnya"
        })
        return
    }

    let [sendOtp, otpCode] = await otp.requestOTPEmail(data[0].value)

    if(sendOtp != 0){
        res.json({
            "status_code": -1,
            "message": "Request OTP Gagal, periksa kembali data yang dimasukan!"
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "OTP Send"
        })
    }
}

const checkRegistration = async (req, res) => {
    let data = [
        {"name": "email", "type": "email", "empty": false, "value": req.body.email},
        {"name": "otp", "type": "number", "empty": false, "value": req.body.otp}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    //validate OTP
    let [rows, fields] = await async_query(
        "SELECT * FROM otp WHERE id IN (SELECT MAX(id) FROM otp GROUP BY data) AND data=? AND value=? AND verify=0 and TIMESTAMPDIFF(MINUTE, updated_at, NOW())<15",
        [data[0].value, data[1].value]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "OTP invalid"
        })
        return
    } else {
        let [rows1, fields1] = await async_query(
            "UPDATE otp SET verify=1 WHERE id=?",
            [rows[0].id]
        )
    }

    let [rows2, fields2] = await async_query(
        "SELECT * FROM jemaat WHERE email=? LIMIT 1",
        [data[0].value]
    )
    
    if(!rows2 || !rows2.length){
        res.json({
            "status_code": 0,
            "data": rows2,
        })
    } else {
        let [rows3, fields3] = await async_query(
            "SELECT * FROM natal_2023 WHERE user_id=?",
            [rows2[0].id]
        )
        
        if(!rows3 || !rows3.length){
            res.json({
                "status_code": 0,
                "data": rows2
            })
        } else {
            res.json({
                "status_code": 0,
                "message": "Email sudah memiliki tiket!",
                "nama": rows2[0].nama,
                "service": rows3[0].waktu_ibadah,
                "code": rows3[0].value
            })
        }
    }

}

const regisNatal = async (req, res) => {
    return res.json({
        "status_code": 0,
        "message": "success"
    })
    let data = [
        {"name": "id", 'type': "numeric", "empty": true, "value": req.body.id},
        {'name': "name", 'type': "alphaspace", "empty": false, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": false, "value": req.body.phone},
        {"name": "birthdate", "type": "date", "empty": false, "value": req.body.birthdate},
        {"name": "email", "type": "email", "empty": false, "value": req.body.email},
        {"name": "residence", "type": "", "empty": false, "value": req.body.residence},
        {"name": "referral", "type": "", "empty": false, "value": req.body.referral},
        {"name": "cool", "type": "", "empty": false, "value": req.body.cool},
        {"name": "service", "type": "numeric", "empty": false, "value": req.body.service},
        {"name": "otp", "type": "number", "empty": false, "value": req.body.otp}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    //validate OTP
    let [rows, fields] = await async_query(
        "SELECT * FROM otp WHERE id IN (SELECT MAX(id) FROM otp GROUP BY data) AND data=? AND value=? AND verify=1",
        [data[4].value, data[9].value]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "OTP invalid"
        })
        return
    } else {
        let [rows1, fields1] = await async_query(
            "UPDATE otp SET verify=2 WHERE id=?",
            [rows[0].id]
        )
    }

    //check jemaat
    let [rows0, fields0] = await async_query(
        "SELECT id FROM jemaat WHERE email=? LIMIT 1",
        [data[4].value]
    )

    if(!rows0 || !rows0.length){
        let [rows, fields] = await async_query(
            "INSERT INTO jemaat (nama, nomor_hp, tanggal_lahir, email, domisili, jemaat, cool) VALUES (?,?,?,?,?,?,?)",
            // "UPDATE jemaat SET nama=?, nomor_hp=?, tanggal_lahir=?, email=?, domisili=?, jemaat=?, cool=? WHERE id=?",
            [data[1].value, data[2].value, data[3].value, data[4].value, data[5].value, data[6].value, data[7].value]
        )
        if(fields == -1){
            res.json({
                "status_code": -1,
                "message": "error",
                "debug": JSON.stringify(rows)
            })
        }
    } else {
        let [rows, fields] = await async_query(
            "UPDATE jemaat SET nama=?, nomor_hp=?, tanggal_lahir=?, email=?, domisili=?, jemaat=?, cool=? WHERE id=?",
            [data[1].value, data[2].value, data[3].value, data[4].value, data[5].value, data[6].value, data[7].value, rows0[0].id]
        )
        if(fields == -1){
            res.json({
                "status_code": -1,
                "message": "error",
                "debug": JSON.stringify(rows)
            })
        }
        console.log(rows)
    }

    let [rows1, fields1] = await async_query(
        "SELECT * FROM jemaat WHERE email=? LIMIT 1",
        [data[4].value]
    )

    //check register
    let [rows2, fields2] = await async_query(
        "SELECT * FROM natal_2023 WHERE user_id=?",
        [rows1[0].id]
    )

    let hash = ""

    if(!rows2 || !rows2.length){
        const code = "natal2023" + data[4].value
        hash = crypto.createHash("sha256").update(code).digest("hex")
        
        let [rows11, fields11] = await async_query(
            "SELECT (SELECT COUNT(waktu_ibadah) FROM natal_2023 WHERE waktu_ibadah=1) as ibadah1, (SELECT COUNT(waktu_ibadah) FROM natal_2023 WHERE waktu_ibadah=2) as ibadah2;",
            [1,2]
        )
        
        if(!rows11 || !rows11.length){
            res.json({
                "status_code": -1,
                "message": "not found"
            })
            return
        } else {
            if(data[8].value == 1 && rows11[0].ibadah1 >= 200){
                res.json({
                    "status_code": -1,
                    "message": "Seat Full!"
                })
                return
            } else if(data[8].value == 2 && rows11[0].ibadah2 >= 200){
                res.json({
                    "status_code": -1,
                    "message": "Seat Full!"
                })
                return
            }
        }
        
        let [rows3, fields3] = await async_query(
            "INSERT INTO natal_2023 (user_id, waktu_ibadah, value) VALUES (?,?,?)",
            [rows1[0].id, data[8].value, hash]
        )

        if(fields3 == -1){
            res.json({
                "status_code": -1,
                "message": "error",
                "debug": JSON.stringify(fields3)
            })
            return
        }

    } else {
        hash = rows2[0].value
    }

    // const email = mail.reactmail({
    //     to: data[4].value,
    //     subject: "[JTCPRJ] Shines From Within - JTCPRJ Christmas Concert 2023",
    //     html: ticketTemplate
    // })

    res.json({
            "status_code": 0,
            "message": "Email not send",
            "code": hash,
            "nama": data[1].value,
            "service": data[8].value
        })

    // if(email != 0){
        
    // } else {
    //     res.json({
    //         "status_code": 0,
    //         "message": "success",
    //         "code": hash,
    //         "nama": data[1].value,
    //         "service": data[8].value
    //     })
    // }
    return
}

const checkSeat = async (req, res) => {
    let [rows, fields] = await async_query(
        "SELECT (SELECT COUNT(waktu_ibadah) FROM natal_2023 WHERE waktu_ibadah=1) as ibadah1, (SELECT COUNT(waktu_ibadah) FROM natal_2023 WHERE waktu_ibadah=2) as ibadah2;",
        [1,2]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "not found"
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success",
            "ibadah_1": 200-rows[0].ibadah1 < 0 ? 0 : 200-rows[0].ibadah1,
            "ibadah_2": 200-rows[0].ibadah2 < 0 ? 0 : 200-rows[0].ibadah2
        })
    }
}

const recap = async () => {
    let [rows3, fields3] = await async_query(
        `SELECT
            waktu_ibadah,
            COUNT(*) AS total,
            SUM(CASE WHEN attend = true THEN 1 ELSE 0 END) AS attend_qr,
            SUM(CASE WHEN value = "9afc4366685eefe648d48b3640764df90145390f9fc60f87fbbc68fd1ef14412" OR value = "05d29a044f1fd22fd6dded0dbe873263a820ff55a4ed5c08d54caf5a3d737f10" THEN 1 ELSE 0 END) AS attend_non_qr
        FROM
            natal_2023
        GROUP BY
            waktu_ibadah;
        `,
        []
    )

    if(!rows3 || !rows3.length){
        return false
    } else {
        return({
            "ibadah1": {
                "total": rows3[0].total,
                "attend": {
                    "qr": parseInt(rows3[0].attend_qr)-parseInt(rows3[0].attend_non_qr),
                    "guest": parseInt(rows3[0].attend_non_qr)
                },

            },
            "ibadah2": {
                "total": rows3[1].total,
                "attend": {
                    "qr": parseInt(rows3[1].attend_qr)-parseInt(rows3[1].attend_non_qr),
                    "guest": parseInt(rows3[1].attend_non_qr)
                },
            },
        })   
    }
}

const getAttend = async (req, res) => {
    const ibadah = await recap()
    if(!ibadah){
        res.json({
            "status_code": -1,
            "message": "error"
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success",
            "ibadah1": ibadah.ibadah1,
            "ibadah2": ibadah.ibadah2
        })
    }
}

const postAttend = async (req, res) => {
    const date_ibadah = {
        1 : new Date("2023-12-10T07:00:00.000Z"),
        2 : new Date("2023-12-10T10:00:00.000Z"),
        3 : new Date("2023-12-10T13:00:00.000Z"),
    }

    let date = new Date()

    let data = [
        {"name": "code", "type": "", "empty": false, "value": req.body.code},
        {"name": "service", "type": "", "empty": true, "value": req.body.service}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    if(!data[1]){
        date = new Date();
    } else {
        if(data[1].value == 1){
            date = new Date("2023-12-10T08:00:00.000Z");
        } else {
            date = new Date("2023-12-10T11:00:00.000Z");
        }
    }

    let response_data = {}

    if(data[0].value == "05d29a044f1fd22fd6dded0dbe873263a820ff55a4ed5c08d54caf5a3d737f10"){ //ibadah2
        let [rows0, fields0] = await async_query(
            "INSERT INTO natal_2023 (user_id, waktu_ibadah, value, attend) VALUES (?,?,?,?)",
            [0, 2, "05d29a044f1fd22fd6dded0dbe873263a820ff55a4ed5c08d54caf5a3d737f10",1]
        )

        response_data = {
            "name": "Guest",
            "email": "-",
            "service": 2,
            "attend": 0
        }
    } else if(data[0].value == "9afc4366685eefe648d48b3640764df90145390f9fc60f87fbbc68fd1ef14412"){ //ibadah1
        let [rows0, fields0] = await async_query(
            "INSERT INTO natal_2023 (user_id, waktu_ibadah, value, attend) VALUES (?,?,?,?)",
            [0, 1, "9afc4366685eefe648d48b3640764df90145390f9fc60f87fbbc68fd1ef14412",1]
        )
        response_data = {
            "name": "Guest",
            "email": "-",
            "service": 1,
            "attend": 0
        }
    } else {
        let [rows, fields] = await async_query(
            "SELECT * FROM natal_2023 WHERE value=?",
            [data[0].value]
        )
    
        if(!rows || !rows.length){
            res.json({
                "status_code": -1,
                "message": "not found"
            })
            return
        } else {
            let [rows2, fields2] = await async_query(
                "SELECT * FROM jemaat WHERE id=?",
                [rows[0].user_id]
            )
            console.log(rows2)
            response_data = {
                "name": rows2[0].nama,
                "email": rows2[0].email,
                "service": rows[0].waktu_ibadah,
                "attend": rows[0].attend
            }
            if(date > date_ibadah[rows[0].waktu_ibadah] && date < date_ibadah[rows[0].waktu_ibadah+1]){
                if(rows[0].attend == 0){
                    let [rows1, fields1] = await async_query(
                        "UPDATE natal_2023 SET attend=1 WHERE value=?",
                        [data[0].value]
                    )
                    response_data["status"] = 0
                } else {
                    response_data["status"] = 1
                }
            } else {
                response_data["status"] = 2
            }
        }
    }

    const ibadah = await recap()
    if(!ibadah){
        res.json({
            "status_code": -1,
            "message": "error"
        })
        return
    } else {
        res.json({
            "status_code": 0,
            "message": "success",
            "ibadah1": ibadah.ibadah1,
            "ibadah2": ibadah.ibadah2,
            "data": response_data
        })
        return
    }
}

const souvenir = async () => {
    let [rows, fields] = await async_query(
        `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN souvenir = 1 THEN 1 ELSE 0 END) AS take,
            SUM(CASE WHEN souvenir = 0 THEN 1 ELSE 0 END) AS not_take
        FROM natal_2023
        WHERE user_id != 0
        `,
        []
    )

    return {
        "total": rows[0].total,
        "take": rows[0].take,
        "not_take": rows[0].not_take
    }
}

const getSouvenir = async (req, res) => {
    const ibadah = await souvenir()
    if(!ibadah){
        res.json({
            "status_code": -1,
            "message": "error"
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success",
            "total": ibadah.total,
            "take": parseInt(ibadah.take),
            "not_take": parseInt(ibadah.not_take)
        })
    }
}

const postSouvenir = async (req, res) => {
    let data = [
        {"name": "code", "type": "", "empty": false, "value": req.body.code}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    let [rows, fields] = await async_query(
        "SELECT * FROM natal_2023 JOIN jemaat ON jemaat.id = natal_2023.user_id WHERE value=?",
        [data[0].value]
    )

    if(!rows || !rows.length){
        return res.json({
            "status_code": -1,
            "message": "QR not found"
        })
    } else {
        let [rows1, fields1] = await async_query(
            "UPDATE natal_2023 SET souvenir = 1 WHERE value=?",
            [data[0].value]
        )
        return res.json({
            "name": rows[0].nama,
            "email": rows[0].email,
            "service": rows[0].waktu_ibadah,
            "attend": rows[0].attend,
            "souvenir": rows[0].souvenir
        })
    }
}

const tesEmail = async (req, res) => {
    let tes = await mail.mail({
        to: "audywijaya500@gmail.com",
        subject: "Tes daftar email Natal 2023",
        html: "<h1>Hai</h1>"
    })
}

module.exports = {
    checkRegistration,
    regisNatal,
    checkSeat,
    requestOTP,
    getAttend,
    postAttend,
    getSouvenir,
    postSouvenir
}