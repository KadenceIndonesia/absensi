const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const IndexRoute = require('./Routers/index');
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const userAgent = require("express-useragent")
require("dotenv").config()
global.baseurl = function(){
	var url = `http://${process.env.HOST}:${process.env.PORT}/`;
    return url;
}

app.set("view engine","ejs")
app.use(express.static("views"))
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(userAgent.express());
app.use(flash());
app.use(session({
    key: 'user_id',
    secret: 'kadence-absensi-2020',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 6000000000000
    },
    name: "Absen"
}));


app.use('/absen/',IndexRoute)

app.listen(process.env.PORT,()=>{
    console.log(`running on ${process.env.HOST}:${process.env.PORT}`);
})