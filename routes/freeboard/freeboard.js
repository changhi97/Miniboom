/* routes - freeboard.js
 * It shows free board
 *
 */

 //webPush를 위한 key가져오기
 require('dotenv').config({
   path: '.key/variables.env'
 });

var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
//var app = express();
var mysql = require('mysql');
var auth = require('../../public/javascripts/auth');
var conn = require('../../public/javascripts/mysql.js'); // mysql connection
var cookieParser = require('cookie-parser');
/*
var url = require('url');
var curURL = url.parse('https://miniboom.site/freeboard');
var curStr = url.format(curURL);

var querystring = require('querystring'); // 쿼리시트링: 요청 파라미터 구분하기
var parm = querystring.parse(curURL.query);

console.log('query의 값: %s', param.query);
*/

// parse : bodyParser
router.use(bodyParser.json());

router.get('/', function (req, res, next) {
  var info = auth.statusUI(req, res);
  getFreeboard(req._parsedOriginalUrl.query, function(result){
    res.render('freeboard/freeboard', {
      result: result, info, // result와 info 값을 리턴(?)
    });
  });
});


//id = post id
/*
router.get(':id', function (req, res, next) {
  console.log("welcome to /:id");
});
*/



//원본 라우터 렌더링 코드
/*
router.get('/', function (req, res, next) {
  var info = auth.statusUI(req, res);
  getFreeboard(req._parsedOriginalUrl.query, function(result){
    res.render('freeboard/freeboard', {
      result: result, info, // result와 info 값을 리턴(?)
    });
  });
});
*/

/* 백업
router.get('/', function (req, res, next) {
  var info = auth.statusUI(req, res);
  getFreeboard(req._parsedOriginalUrl.query, function(result){
    res.render('freeboard/freeboard/', {
      result: result, info, // result와 info 값을 리턴(?)
    });
  });
});
*/



module.exports = router;

function getFreeboard(msg, callback){
  try{

    var boardnum = msg.split("=")[1]; //split()메소드는 String 객체를 지정한 구분자로 여러개로 나눈다.

    boardnum = ((boardnum-1)*10); // db는 0번부터 시작한다. 0-9는 총 10개
  } catch{
    boardnum = 0;
  }

  var sql = "SELECT num, title, user_id, created, views from FREEBOARD FB "; //FREEBOARD FB는 FREEBOARD를 FB로 사용한다고 정의함
      sql += "WHERE (@rownum:=0)=0 "
      sql += "ORDER by FB.created DESC "
      sql += "limit "+boardnum+", 10;";

  var sql2 = "SELECT COUNT(*) AS num FROM FREEBOARD";

  function getFormDate(value){
    var date = new Date(value);
    //var year = date.getFullYear() + "년 ";
    var month = date.getMonth()+1 + "월 ";
    var day = date.getDate() + "일 ";
    var hour = date.getHours() + "시 ";
    var minutes = date.getMinutes() + "분 ";
    //var seconeds = date.getSeconds() +"초 ";

    return month + day + hour + minutes; //+ seconeds;
  }

  conn.query(sql, function (err, result) {
      if (err) throw err;
      conn.query(sql2, function (err, result2) {
        if (err) throw err;

        var msg = new Object();

        for(var i=0; i<result.length; i++){
          result[i].created = getFormDate(result[i].created);
        }

        msg.data = result;
        msg.boardNum = result2[0]['num']/10 + 1;

        callback(msg);
        return

      });
  });
}
