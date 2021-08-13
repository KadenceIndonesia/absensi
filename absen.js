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
	return process.env.ENV === 'production' ?
        `http://survey.kadence.co.id:${process.env.PORT}/`
            :
        `http://survey.kadence.co.id:${process.env.PORT}/`;
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
        expires: 600000
    },
    name: "Absen"
}));


app.use('/absen/',IndexRoute)

app.listen(process.env.PORT, process.env.HOST, ()=>{
    console.log(`running on ${process.env.HOST}:${process.env.PORT}`);
})