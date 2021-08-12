const mysql = require("mysql");
require("dotenv").config()

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

con.connect(err => {
    if (err){
        //console.log('error connecting: ' + err.stack)
        return;
    }
    //console.log('connected as id ' + con.threadId);
})

module.exports = con;   