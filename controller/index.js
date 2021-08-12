const moment = require('moment');
const db = require('../models/db');
const computerName = require('computer-name');
const CryptoJs = require("crypto-js");
const Cryptr = require("cryptr");
const cryptr = new Cryptr('kadence');
const clientip = require("client-ip")
exports.getRegister = (req,res) =>{
    res.render("register",{messages: req.flash('register')});
}

exports.getForget = (req,res) =>{
    res.render("forget",{messages: req.flash('forget')});
}

exports.getEditPassword = (req,res) =>{
    let user = req.session.user[0].Email;
    res.render("editpassword",{messages: req.flash('edit'),username:user});
}

function lookupUser(email){
    return new Promise(resolve => {
        db.query("SELECT * FROM user WHERE Email=?",email, function(err,result){
            if(err){
                resolve(0)
            }else{
                var count = result.length
                resolve(count)
            }
        })
    })
}

exports.postForget = async (req,res) =>{
    let username = req.body.username;
    let countUser = await lookupUser(username);
    if(countUser>0){
        let encryptpass = cryptr.encrypt('kadence'); 
        let sql1 = "UPDATE `user` SET Password=? WHERE Email=?";
        db.query(sql1,[encryptpass,username],(err,result)=>{
            console.log(result);
            req.flash('login', 'Reset Password Success!, Please login your username : `'+username+'`, and password: `kadence` || Dont Forget to update your password after your login success')
            res.redirect('/absen/login');
        })
    }else{
        req.flash('forget', 'Email not Found on Database, Please Register!')
        res.redirect('/absen/forget');
    }
}

exports.postEditPassword = async (req,res)=>{
    let user = req.session.user[0].Email;
    let password = req.body.password;
    const encryptpass = cryptr.encrypt(password);
    let sql1 = 'UPDATE `user` SET Password=? WHERE Email=?';
    db.query(sql1,[encryptpass,user],(err,result)=>{
        req.flash('login', 'Update Password has been Success!. Please login again with new Password');
        res.redirect('/absen/login');
    })
}

exports.postRegister = async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    let kadence = username.split('@');
    var computer = computerName()
    const encryptpass = cryptr.encrypt(password);
    var countUser = await lookupUser(username);
    if (kadence[1]!='kadence.com'){
        res.redirect('/absen/register')
    }else{
        if (countUser>0){
            req.flash('register', 'Email has been registered!')
            res.redirect('/absen/register');
        }else{
            var save = ({Email: username, Password: encryptpass, computer_name: computer, is_admin: 0});
            db.query("INSERT INTO user set ?",save,function(err,result){
                if(err){
                    console.log(err)
                }else{
                    req.flash('login', 'Success Registered, GOOD JOB!');
                    res.redirect('/absen/login');
                }
            })
        }
        
    }
}

exports.getLogin = (req,res) =>{
    var session = req.session.user
    res.render("login",{
        messages: req.flash('login'),
        session: session
    });
}

exports.postLogin = (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    db.query('SELECT * FROM user WHERE Email=?',[username],(err,result)=>{
        if (result.length>0){
            var decryptpass = cryptr.decrypt(result[0].Password)
            if(password==decryptpass){
                req.session.loggedin = true;
                req.session.user = result;
                res.redirect('/absen/')
            }else{
                res.redirect('/absen/login')    
            }
        }else{
            res.redirect('/absen/login')
        }
    })
}

exports.getLogout = (req,res) =>{
        req.session.destroy();
        res.redirect('/absen/login');
}

exports.getIndex = (req,res) =>{
    if (req.session.loggedin==true){
        var computer = computerName()
        var session = req.session.user;
        let user = req.session.user[0].id;
        let now = new Date();
        let date = moment().format('YYYY-MM-DD');
        var browser = req.useragent.browser
        var platform = req.useragent.platform
        var os = req.useragent.os
        var device = browser+" "+platform+" "+os
        let sdate = 'SELECT user_id,date FROM `absensi` WHERE date=? AND user_id=?';
        db.query(sdate,[date,user],(err2,result2)=>{
            if (result2.length>0){
                let sql1 = 'SELECT user_id, clockin,clockout,date FROM `absensi` WHERE date = ? AND user_id=?';
                db.query(sql1,[date,user],(err,result)=>{
                    res.render("index",{
                        data:result,
                        moment:moment,
                        session: session
                    });
                })
            }else{
                var saveabsensi = ({user_id: user, date: now, computer_name: computer, device: device})
                db.query("INSERT INTO absensi set ?",[saveabsensi],(errs,results)=>{
                    let sql2 = 'SELECT user_id, clockin,clockout,date FROM `absensi` WHERE date = ? AND user_id=?';
                    db.query(sql2,[date,user],(err3,result3)=>{
                        res.render("index",{
                            data:result3,
                            moment:moment,
                            session: session
                        });
                    })
                })
            }
        })
    }else{
        res.redirect('/absen/login');
    }
}

exports.getSuggestionBox = (req, res) => {
    if (req.session.loggedin==true){
        var computer = computerName()
        var session = req.session.user;
        let user = req.session.user[0].id;
        let now = new Date();
        let date = moment().format('YYYY-MM-DD');
        var browser = req.useragent.browser
        var platform = req.useragent.platform
        var os = req.useragent.os
        var device = browser+" "+platform+" "+os
        let sdate = 'SELECT user_id,date FROM `absensi` WHERE date=? AND user_id=?';
        db.query(sdate,[date,user],(err2,result2)=>{
            if (result2.length>0){
                let sql1 = 'SELECT user_id, clockin,clockout,date FROM `absensi` WHERE date = ? AND user_id=?';
                db.query(sql1,[date,user],(err,result)=>{
                    res.render("suggestionbox",{
                        data:result,
                        moment:moment,
                        session: session
                    });
                })
            }else{
                var saveabsensi = ({user_id: user, date: now, computer_name: computer, device: device})
                db.query("INSERT INTO absensi set ?",[saveabsensi],(errs,results)=>{
                    let sql2 = 'SELECT user_id, clockin,clockout,date FROM `absensi` WHERE date = ? AND user_id=?';
                    db.query(sql2,[date,user],(err3,result3)=>{
                        res.render("suggestionbox",{
                            data:result3,
                            moment:moment,
                            session: session
                        });
                    })
                })
            }
        })
    }else{
        res.redirect('/absen/login');
    }
}

exports.postSuggestionBox = (req,res) =>{
    if (req.session.loggedin==true){
        const user = req.session.user[0].id;
        const datetime = moment().format("YYYY-MM-DD HH:mm:ss");
        const sdate = 'SELECT user_id, email FROM `user` WHERE user_id=?';
        const mind = req.body.mind;
        const wish = req.body.wish;
        const anonymous = req.body.anonymous === 'on' ? 1 : 0;

        const save = ({user_id: user, mind: mind, wish: wish, anonymous: anonymous, suggestion_date: datetime})
        const sql = "INSERT INTO suggestion set ?";
        db.query(sql ,[save],(err,results)=>{
            res.redirect('/absen/');
        });
        
    }else{
        res.redirect('../login');
    }
    
}

exports.postClockIn = (req,res) =>{
    if (req.session.loggedin==true){
        let user = req.session.user[0].id;
        let now = new Date();
        let hostname = req.body.ipInput;
        let worktype = req.body.worktype;
        let date = moment().format('YYYY-MM-DD');
        let sdate = 'SELECT user_id,date FROM `absensi` WHERE date=? AND user_id=?';
        db.query(sdate,[now,user],(err2,result2)=>{
            db.query(sql1,[now,hostname,worktype,user,date],(err,result)=>{
                res.redirect('/absen/');
            });
        });
    }else{
        res.redirect('../login');
    }
    
}

exports.postClockOut = (req,res)=>{
    if (req.session.loggedin==true){
        let user = req.session.user[0].id;;
        let clockout = new Date();
        let date = moment().format('YYYY-MM-DD');
        var browser = req.useragent.browser
        var platform = req.useragent.platform
        var os = req.useragent.os
        var device = browser+" "+platform+" "+os
        let sql1 = 'SELECT id, clockin FROM `absensi` WHERE date = ? AND user_id=?';
        db.query(sql1,[date,user],(err,result)=>{
            let sql2 = "UPDATE `absensi` SET clockout=?, device=? WHERE user_id=? AND date=?";
            db.query(sql2,[clockout,device,user,date],(err1,result1)=>{
                res.redirect('/absen/');
            })
        });
    }else{
        res.redirect('../login');
    }
}

