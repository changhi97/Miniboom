var express = require('express');
var router = express.Router();
var auth = require('../../../public/javascripts/auth');
const bodyParser = require('body-parser');
var app = express();
var conn = require('../../../public/javascripts/mysql');
var cookieParser = require('cookie-parser');

router.use(bodyParser.json());

router.get('/:pageId',function(req, res){
  result = 1;
  info = 1;
  res.render('freeboard/post/freeboardPost', {
    result: result, info, // result와 info 값을 리턴(?)
  });
});

// 백업
/*
router.get('/:pageId',function(req,res){
    var Obj ={
        "HTML": "HTML is....",
        "CSS" : "CSS is...."
    }
    var html = `
    <a href="/page/HTML">HTML</a>
    <a href="/page/CSS">CSS</a>

    <p>${Object[req.params.pageId]}</p>
    `;

    res.send(html);
});
*/
module.exports = router;
/*
router.get('/', function (req, res) {

  getBoard(req._parsedOriginalUrl.query, function(result){
    res.render('/freeboard', {
      result: result,
    });
  });
});

*/
/*
// GET users listing
router.get('/', function(req, res) {
  var info = auth.statusUI(req,res);
  console.log("freeboard/:id");
    res.render('freeboard/:id', { // freeboardwrite.ejs
    info: info,
    id: id,
    title: title,
    content: content,
    writer: writer,
    comment: comment,
    view: view,
  //res.getClientAddress(req);
  });
});

module.exports = router;
*/
