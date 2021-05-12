var express = require('express');
var router = express.Router();
var auth = require('../../../public/javascripts/auth');
const bodyParser = require('body-parser');
var app = express();
var conn = require('../../../public/javascripts/mysql');
var cookieParser = require('cookie-parser');
module.exports = router;

router.use(bodyParser.json());

router.get('/:pageId',async function(req, res){
  var info = auth.statusUI(req, res); // 쿠키 정보

  var result = 0; // 일단 0으로 초기화
  //var pageId =  -1; // 초기화

  this.pageId = pageId;

  //getPost(function(pageId, result) { // 페이지 정보를 얻기위한 함수
  res.render('freeboard/post/freeboardPost', {
    result: result,
    info: info, // result와 info 값을 리턴(?)
    pageId: req.params.pageId
  });
//});
});

// 미완성
// 함수 이름: getPoster
// 함수 목적: 글의 정보(글 번호, 제목, 작성자, 내용, 작성날짜, 조회수, 추천수  )
function getPost(pageId, callback) {
  var sql = "SELECT num, title, user_id, content, created, views, recommend from FREEBOARD";

}

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
