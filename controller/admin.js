const moment = require('moment');
const db = require('../models/db');
const computerName = require('computer-name');
const xlsx = require("node-xlsx")
const fs = require("fs")

exports.getAdmin = (req,res) => {
    if (req.session.loggedin==true){
        var session = req.session.user
        // if(session[0].is_admin!=1){
        //     res.redirect("../absen")
        // }else{
            res.render("admin", {
                session: session,
                moment: moment
            })
        // }
    }else{
        res.redirect("../absen/login")
    }
}

function getUserById(id){
    return new Promise(resolve => {
        db.query("SELECT * FROM user WHERE id=?",id,function(err,result){
            resolve(result)
        })
    })
}

global.getAbsenByDate = function(date,uid){
    return new Promise(resolve => {
        db.query("SELECT * FROM absensi WHERE date=? AND user_id=?",[date,uid], function(err,result){
            resolve(result)
        })
    })
}

global.userGet = function(isadmin,email){
    return new Promise(resolve => {
        if(isadmin!=1){
            db.query("SELECT * FROM user WHERE Email=?",[email], function(err,result){
                resolve(result)
            })
        }else{
            db.query("SELECT * FROM user", function(err,result){
                resolve(result)
            })
        }
    })
}

global.msToTime = function(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }


exports.getExport = async function(req,res){
    if (req.session.loggedin==true){
        var datefrom = req.body.date_from
        var dateto = req.body.date_to
        var a = moment(dateto);
        var b = moment(datefrom);
        var diff = a.diff(b, 'days')
        var userid = req.session.user[0].id
        var data = ({date_from: datefrom, date_to: dateto})
        var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
        var newfilename = "REPORT_"+formatdate+".xlsx";
        var getUser = await userGet(req.session.user[0].is_admin,req.session.user[0].Email)
        var isifile = [];
        for (let u = 0; u < getUser.length; u++) {            
            for (let i = 0; i <= diff; i++) {
                var day = moment(dateto).subtract(i, 'days').format('YYYY-MM-DD');
                var absence = await getAbsenByDate(day,getUser[u].id)
                if(absence.length>0){
                    var splitclockin = absence[0].clockin.split(":")
                    var splitclockout = absence[0].clockout.split(":")
                    var countjamin = (parseInt(splitclockin[0]) * 3600) + (parseInt(splitclockin[1]) * 60) + parseInt(splitclockin[2])
                    var countjamout = (parseInt(splitclockout[0]) * 3600) + (parseInt(splitclockout[1]) * 60) + parseInt(splitclockout[2])
                    var seconds = countjamout - countjamin;
                    var formatted = "-"
                    if (seconds>0) {
                        formatted = new Date(seconds * 1000).toISOString().substr(11, 8)
                        var keterangan = "-"
                    }else if(seconds==0){
                        var keterangan = "No Absence"
                    }else{
                        var keterangan = "No Clockout"
                    }
                    // var valofclockin = moment([splitclockin[0], splitclockin[1], splitclockin[2]])
                    // var valofclockout = moment([splitclockout[0], splitclockout[1], splitclockout[2]])
                    // var difftime = valofclockout-valofclockin
                    // var formatTime = await msToTime(difftime)
                    // if (difftime==0) {
                    //     var keterangan = "No Absence"
                    // }else if(difftime<0){
                    //     var keterangan = "No Clockout"
                    //     var formatTime = "-"
                    // }
                    // console.log(formatted)
                    // if(formatTime=="NaN:NaN:NaN.NaN"){
                    //     formatTime="00:00:00"
                    // }
                    isifile.push([
                        getUser[u].Email,
                        absence[0].hostname,
                        moment(absence[0].date).format("YYYY-MM-DD"),
                        absence[0].clockin,
                        absence[0].clockout,
                        formatted,
                        absence[0].worktype,
                        keterangan
                    ])
                }else{
                    var ket = "No Absence"
                    if(moment(day).format("dddd")=="Sunday" || moment(day).format("dddd")=="Saturday"){
                        var ket = "Weekend"
                    }
                    isifile.push([
                        getUser[u].Email,
                        "-",
                        day,
                        "00:00:00",
                        "00:00:00",
                        "00:00:00",
                        "-",
                        ket
                    ])
                }
            }
        }
        var header = [
            [
                "User Email",
                "IP Address",
                "Date",
                "Clock In",
                "Clock Out",
                "Work Hour",
                "Worktype",
                "Keterangan"
            ]
        ]
        var createfile = header.concat(isifile)
        const progress = xlsx.build([{name: "Data", data: createfile}])
        fs.writeFile("public/filexls/"+newfilename, progress, function (errwritefile) {
            if(errwritefile){
                console.log("error")
            }else{
                res.render("download",{
                    newfilename: newfilename
                })
            }
        })
    }else{
        res.redirect("../absen/login")
    }
}