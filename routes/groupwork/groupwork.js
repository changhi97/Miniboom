var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('../../public/javascripts/auth');
var conn = require('../../public/javascripts/mysql.js');

router.get('/', function (req, res, next) {
  var info = auth.statusUI(req, res);
    res.render('groupwork/groupwork', {
      info: info
    });
});

module.exports = router;
