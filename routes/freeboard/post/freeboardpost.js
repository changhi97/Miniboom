var express = require('express');
var router = express.Router();
var auth = require('../../../public/javascripts/auth');
const bodyParser = require('body-parser');
var app = express();
var conn = require('../../../public/javascripts/mysql');
var cookieParser = require('cookie-parser');

router.use(bodyParser.json());

get('/:id', function(req , res){
  res.render('article' + req.params.id);
});

// GET users listing
router.get('/', function(req, res) {
  var info = auth.statusUI(req,res);

  res.render('freeboard/:id', { // freeboardwrite.ejs
    info: info,
  //res.getClientAddress(req);
  });
});

module.exports = router;
