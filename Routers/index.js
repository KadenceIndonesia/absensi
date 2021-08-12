const express = require("express");
const Router = express.Router();
const Controller = require('../controller/index');
const adminController = require("../controller/admin")

Router.get('/',Controller.getIndex);
Router.get('/login',Controller.getLogin);
Router.post('/login',Controller.postLogin);

Router.get('/suggestion-box',Controller.getSuggestionBox);
Router.post('/suggestion-box',Controller.postSuggestionBox);

Router.get('/logout',Controller.getLogout);

Router.get('/register',Controller.getRegister);
Router.post('/register',Controller.postRegister);

Router.get('/forget',Controller.getForget);
Router.post('/forget',Controller.postForget);

Router.get('/editpassword',Controller.getEditPassword);
Router.post('/editpassword',Controller.postEditPassword);

Router.post('/clockIn',Controller.postClockIn);
Router.post('/clockOut',Controller.postClockOut);

Router.get('/admin',adminController.getAdmin);
Router.post('/admin/export',adminController.getExport);

module.exports = Router