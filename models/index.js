const mysql = require('mysql2')

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'dev_jtcprj'
})

module.exports = { conn }