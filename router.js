const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
    res.json({
        "status_code": 0,
        "message": "success"
    })
})

//linktree
const {
    registrasiPelayanan,
    registrasiCool,
    registrasiJemaat,
    prayerRequest,
    praiseReport,
    tes,
    daftarPengerja,
    getKegiatanCool,
    postKegiatanCool,
    getAbsenCool,
    postAbsenCool,
    getSubmitAbsenCool,
    postSubmitAbsenCool,
} = require("./controllers/formController")
router.post('/registrasi-cool', registrasiCool)
router.post("/registrasi-pelayanan", registrasiPelayanan)
router.post('/registrasi-jemaat', registrasiJemaat)
router.post("/prayer-request", prayerRequest)
router.post("/praise-report", praiseReport)

router.get("/tes", tes)

// cool
router.post("/daftar-pengerja", daftarPengerja)
router.get("/kegiatan-cool", getKegiatanCool)
router.post("/kegiatan-cool", postKegiatanCool)
router.get("/absen-cool/:code", getAbsenCool)
router.post("/absen-cool/:code", postAbsenCool)
router.get("/submit-absen-cool/:code", getSubmitAbsenCool)
router.post("/submit-absen-cool/:code", postSubmitAbsenCool)

//natal
const {
    checkRegistration,
    regisNatal,
    checkSeat,
    requestOTP,
    getAttend,
    postAttend,
    getSouvenir,
    postSouvenir
} = require("./controllers/natal2023Controller")
router.post("/natal2023/checkData", checkRegistration)
router.post("/natal2023/registration", regisNatal)
router.get("/natal2023/checkSeat", checkSeat)
router.post("/natal2023/requestOTP", requestOTP)
router.get("/natal2023/attend", getAttend)
router.post("/natal2023/attend", postAttend)
router.get("/natal2023/souvenir", getSouvenir),
router.post("/natal2023/souvenir", postSouvenir)

//linebot
const {
    webhook, sendMessage, sendCarousel
} = require('./controllers/lineController')
// router.get("/", index)
router.post('/linebot/webhook', webhook)
router.post("/linebot/send-message", sendMessage)
router.post("/linebot/send-carousel", sendCarousel)

module.exports = router