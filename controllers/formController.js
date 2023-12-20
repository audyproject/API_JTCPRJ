const async_query = require("../models/async.js")
const validator = require('validator')
const request = require('request')

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

const registrasiCool = async (req, res) => {
    let data = [
        {'name': "name", 'type': "alphaspace", "empty": false, "value": req.body.name},
        {"name": "birthdate", "type": "date", "empty": false, "value": req.body.birthdate},
        {"name": "phone", "type": "numeric", "empty": false, "value": req.body.phone},
        {"name": "residence", "type": "", "empty": false, "value": req.body.residence}
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
        "INSERT INTO regis_cool (name, birthdate, phone, residence) VALUES (?,?,?,?)",
        [data[0].value, data[1].value, data[2].value, data[3].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const registrasiPelayanan = async (req, res) => {

    if(!req.body.phone && !req.body.line){
        res.json({
            "status_code": -1,
            "message": "phone or line cannot be empty"
        })
        return
    }

    let data = [
        {"name": "name", "type": "alphaspace", "empty": false, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": true, "value": req.body.phone},
        {"name": "line", "type": "", "empty": true, "value": req.body.line},
        {"name": "job", "type": "", "empty": false, "value": req.body.job}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message,
            "data": data
        })
        return
    }

    let [rows, fields] = await async_query(
        "INSERT INTO regis_pelayanan (name, phone, line, job) VALUES (?,?,?,?)",
        [data[0].value, data[1].value, data[2].value, data[3].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const registrasiJemaat = async (req, res) => {

    if(!req.body.phone && !req.body.line){
        res.json({
            "status_code": -1,
            "message": "phone or line cannot be empty"
        })
        return
    }

    let data = [
        {'name': "name", 'type': "alphaspace", "empty": false, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": false, "value": req.body.phone},
        {"name": "birthdate", "type": "date", "empty": false, "value": req.body.birthdate},
        {"name": "email", "type": "email", "empty": false, "value": req.body.email},
        {"name": "residence", "type": "", "empty": false, "value": req.body.residence},
        {"name": "referral", "type": "", "empty": false, "value": req.body.referral},
        {"name": "cool", "type": "", "empty": false, "value": req.body.cool},
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
        "INSERT INTO jemaat (nama, nomor_hp, tanggal_lahir, email, domisili, jemaat, cool) VALUES (?,?,?,?,?,?,?)",
        [data[0].value, data[1].value, data[2].value, data[3].value, data[4].value, data[5].value, data[6].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const prayerRequest = async (req, res) => {
    let data = [
        {"name": "name", "type": "alphaspace", "empty": true, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": true, "value": req.body.phone},
        {"name": "message", "type": "", "empty": false, "value": req.body.message}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "INSERT INTO prayer_request (name, phone, message) VALUES (?,?,?)",
        [data[0].value, data[1].value, data[2].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const praiseReport = async (req, res) => {
    let data = [
        {"name": "name", "type": "alphaspace", "empty": true, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": true, "value": req.body.phone},
        {"name": "message", "type": "", "empty": false, "value": req.body.message}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "INSERT INTO praise_report (name, phone, message) VALUES (?,?,?)",
        [data[0].value, data[1].value, data[2].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const daftarPengerja = async (req, res) => {
    let data = [
        {"name": "name", "type": "alphaspace", "empty": false, "value": req.body.name},
        {"name": "gender", "type": "", "empty": false, "value": req.body.gender},
        {"name": "birthdate", "type": "date", "empty": false, "value": req.body.birthdate},
        {"name": "address", "type": "", "empty": false, "value": req.body.address},
        {"name": "postalcode", "type": "numeric", "empty": false, "value": req.body.postalcode},
        {"name": "phone", "type": "numeric", "empty": false, "value": req.body.phone},
        {"name": "lineid", "type": "", "empty": false, "value": req.body.lineid},
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "INSERT INTO pengerja (name, gender, birthdate, address, postalcode, phone, lineid) VALUES (?,?,?,?,?,?,?)",
        [data[0].value, data[1].value, data[2].value, data[3].value, data[4].value, data[5].value, data[6].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const getKegiatanCool = async (req, res) => {
    const [rows, fields] = await async_query(
        "SELECT id, name FROM cool",
        null
    )

    console.log(rows)
    res.json({
        "status_code": 0,
        "data": rows
    })
}

const postKegiatanCool = async (req, res) => {
    let data = [
        {"name": "cool_id", "type": "numeric", "empty": false, "value": req.body.cool_id},
        {"name": "date", "type": "date", "empty": false, "value": req.body.date},
        {"name": "location", "type": "", "empty": false, "value": req.body.location}
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const code = Math.random().toString(36).slice(3, 11);
    // res.json({
    //     code: code
    // })
    // return

    const [rows, fields] = await async_query(
        "INSERT INTO kegiatan_cool (cool_id, date, location, code) VALUES (?,?,?,?)",
        [data[0].value, data[1].value, data[2].value, code]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success",
            "data": {
                "code": code
            }
        })
    }
}

const getSubmitAbsenCool = async (req, res) => {
    let data = [
        {"name": "code", "type": "alphanumeric", "empty": false, "value": req.params.code},
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "SELECT kegiatan_cool.id, name, date, location, submit FROM kegiatan_cool JOIN cool ON cool.id = kegiatan_cool.cool_id WHERE code=?",
        [data[0].value]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "not found"
        })
    } else if(rows[0].submit == 1){
        res.json({
            "status_code": -1,
            "message": "Absen sudah disubmit!"
        })
    }

    const [rows1, fields1] = await async_query(
        "SELECT id, pengerja, name, phone FROM absen_cool WHERE kegiatan_cool_id=?",
        [rows[0].id]
    )

    if(!rows1 || !rows1.length){
        rows[0].absen = []
    } else {
        rows[0].absen = rows1
    }

    res.json({
        "status_code": 0,
        "message": "success",
        "data": rows[0]
    })
}

const postSubmitAbsenCool = async (req, res) => {
    let data = [
        {"name": "code", "type": "alphanumeric", "empty": false, "value": req.params.code},
        {"name": "absen_cool_id", "type": "", "empty": false, "value": req.body.absen_cool_id},
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows0, fields0] = await async_query(
        "SELECT id, submit FROM kegiatan_cool WHERE code=?",
        [data[0].value]
    )

    if(!rows0 || !rows0.length){
        res.json({
            "status_code": -1,
            "message": "not found"
        })
        return
    } else if(rows0[0].submit == 1){
        res.json({
            "status_code": -1,
            "message": "Absen sudah disubmit!"
        })
        return
    }

    let query = "UPDATE absen_cool SET `check`=1 WHERE kegiatan_cool_id=? AND ("
    let query_data = [data[0].value]

    req.body.absen_cool_id.forEach((element, i) => {
        if(i!=0) query = query + " OR "
        query = query + "id=?"
        query_data.push(element)
    });

    query = query + ")"

    // const [rows, fields] = await async_query(
    //     "SELECT id FROM kegiatan_cool WHERE code=?",
    //     [data[0].value]
    // )

    // res.json({
    //     "query": query,
    //     "query_data": query_data
    // })
    // return

    const [rows, fields] = await async_query(
        query,
        query_data
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
        return
    }

    const [rows1, fields1] = await async_query(
        "UPDATE kegiatan_cool SET submit=1 WHERE code=?",
        [data[0].value]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const getAbsenCool = async (req, res) => {
    let data = [
        {"name": "code", "type": "alphanumeric", "empty": false, "value": req.params.code},
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "SELECT kegiatan_cool.id, name, date, location, submit FROM kegiatan_cool JOIN cool ON cool.id = kegiatan_cool.cool_id WHERE code=?",
        [data[0].value]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "not found"
        })
        return
    } else if(rows[0].submit == 1){
        res.json({
            "status_code": -1,
            "message": "Absen sudah disubmit!"
        })
        return
    }
    
    res.json({
        "status_code": 0,
        "message": "success",
        "data": rows[0]
    })
    

    return
}

const postAbsenCool = async (req, res) => {
    let data = [
        {"name": "code", "type": "alphanumeric", "empty": false, "value": req.params.code},
        {"name": "name", "type": "", "empty": false, "value": req.body.name},
        {"name": "phone", "type": "numeric", "empty": false, "value": req.body.phone},
    ]

    let check = validate(data)

    if(check.status == -1){
        res.json({
            "status_code": -1,
            "message": check.message
        })
        return
    }

    const [rows, fields] = await async_query(
        "SELECT id FROM kegiatan_cool WHERE code=?",
        [data[0].value]
    )

    if(!rows || !rows.length){
        res.json({
            "status_code": -1,
            "message": "not found"
        })
    }

    const [rows0, fields0] = await async_query(
        "SELECT * FROM pengerja WHERE phone=? AND name LIKE ?",
        [data[2].value, data[1].value]
    )

    let pengerja = 0
    if(!rows0 || !rows0.length){
        pengerja = 0
    } else {
        pengerja = 1
    }

    const [rows1, fields1] = await async_query(
        "INSERT INTO absen_cool (kegiatan_cool_id, name, phone, pengerja) VALUES (?,?,?,?)",
        [rows[0]['id'], data[1].value, data[2].value, pengerja]
    )

    if(fields == -1){
        res.json({
            "status_code": -1,
            "message": "error",
            "debug": JSON.stringify(rows)
        })
    } else {
        res.json({
            "status_code": 0,
            "message": "success"
        })
    }
}

const tes = async (req, res) => {

    let data = [
        {
            "title": "Tes Title 1",
            "text": "Tes Text 1",
            // defaultAction: {type: "uri", label: "view label", uri: "https://dev.api.jtcprj.org/"},
            "actions": [
                {"type": "message", "label": "Done", "text": "Done"},
                {"type": "message", "label": "None", "text": "None"}
            ]
        },
        {
            title: "Tes Title 2",
            text: "Tes Text 2",
            // defaultAction: {type: "uri", label: "view label", uri: "https://dev.api.jtcprj.org/"},
            actions: [
                {type: "message", label: "Done", text: "Done"},
                {type: "message", label: "None", text: "None"}
            ]
        }
    ]

    request.post({
        url: "https://dev.api.jtcprj.org/linebot/send-carousel",
        json: {
            userId: "Ca196abd5ac8b1d56835f3c73a8cc0fba",
            data: data,
            token: "Chrystal@12"
        }
    }, (error, response, body) => {
        res.json(body)
        return
    })
}

module.exports = {
    registrasiCool,
    registrasiPelayanan,
    registrasiJemaat,
    praiseReport,
    prayerRequest,
    daftarPengerja,
    getKegiatanCool,
    postKegiatanCool,
    getAbsenCool,
    postAbsenCool,
    getSubmitAbsenCool,
    postSubmitAbsenCool,
    tes
}