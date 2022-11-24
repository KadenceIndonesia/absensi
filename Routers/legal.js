const express = require("express");
const Router = express.Router();
const Controller = require('../controller/legal');

Router.get('/',Controller.getLegal);

module.exports = Router