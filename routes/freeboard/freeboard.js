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

// parse : bodyParser
router.use(bodyParser.json());


/* 원본 라우터 렌더링 코드
router.get('/', function(req, res) {
  var info = auth.statusUI(req,res);
  //freeboard direcotry -> freeboard.ejs
  res.render('freeboard/freeboard', info);
  //res.getClientAddress(req);
});
*/

router.get('/', function (req, res) {
  var info = auth.statusUI(req, res);
  getFreeboard(req._parsedOriginalUrl.query, function(result){
    res.render('freeboard/freeboard', {
      result: result, info // 
    });
  });
});


module.exports = router;



function getFreeboard(msg, callback){

  try{
    //split()메소드는 String 객체를 지정한 구분자로 여러개로 나눈다.
    var boardnum = msg.split("=")[1];
    // db는 0번부터 시작한다. 0-9는 총 10개
    boardnum = ((boardnum-1)*10);
  } catch{
    boardnum = 0;
  }

/*
  var sql  = "SELECT b.id, b.title, u.nickname, b.writer_id, b.created, b.view ";
      sql += "FROM board b "
      sql += "JOIN user_info u "
      sql += "ON b.writer_id = u.id "
      sql += "WHERE (@rownum:=0)=0 "
      sql += "ORDER BY b.created DESC "
      sql += "limit "+boardnum+", 10;";
*/
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
