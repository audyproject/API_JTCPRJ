const mysql = require("mysql2/promise")
const env = require("../env.json")

async function async_query(query, data) {
    const conn = await mysql.createConnection({
        host: env.database.host,
        user: env.database.username,
        password: env.database.password,
        database: env.database.database
    })
    try{
        let [rows, fields] = await conn.execute(query, data)
        await conn.end();
        return await [rows, fields]
    } catch(e) {
        await conn.end();
        return await [e, -1]
    }
}

module.exports = async_query