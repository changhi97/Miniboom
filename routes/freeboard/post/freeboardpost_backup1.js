var express = require('express');
var router = express.Router();
var auth = require('../../../public/javascripts/auth');
const bodyParser = require('body-parser');
// var app = express();
var conn = require('../../../public/javascripts/mysql');
var cookieParser = require('cookie-parser');
module.exports = router;

router.use(bodyParser.json());
router.use(cookieParser())

router.get('/:pageId',async function(req, res){
  var info = auth.statusUI(req, res); // 쿠키 정보
  var pageId = req.cookies['pageId'];

  getPost(pageId, function(msg){
    var result = msg.data[0];
    var result3 = msg.comment;



    // 예외 처리로써 댓글이 0 일때 글을 못불러오는것을 방지하기 위함
    if(result3 == undefined){
      result3 = 0;
    }
    // 일단 0으로 초기화 시켜놓음
    //var comment = msg.data[0]; // comment.data[0];
    //console.log("comment: ", comment);


    result.created = getDataForm(result.created);
    result3.created = getDataForm(result3.created);

    res.render('freeboard/post/freeboardPost', {
      result: result,
      result3: result3, // DB로 부터 받은 댓글 정보
      info: info,
      pageId: pageId
      //comment: comment
      });
  });
});

router.post('/:pageId' , function(req, res, next){
  var flag = req.body['flag'];
  if(flag == "getPost"){
    getPoster(req.body, function(result){
      res.json(result);
    });
  } else if(flag == "deletePost"){
    deletePost(req.body, function(result){
      res.json(result);
    });
  } else if(flag == "writeComment") {
    writeComment(req.body, function(result){
      res.json(result);
    })
  }
});



// 미완성
// 함수 이름: getPoster
// 함수 목적: 글의 정보(글 번호, 제목, 작성자, 내용, 작성날짜, 조회수, 추천수  )
function getPost(pageId, callback) {

  // 글의 정보를 객체속 배열로 불러옴
  var sql = "SELECT * FROM FREEBOARD ";
      sql += "WHERE num = " + pageId;

  // 글 조회시 조회수 1 증가
  var sql2 =  "UPDATE FREEBOARD "
      sql2 += "SET views = views+1 "
      sql2 += "WHERE num = "+pageId;

  // 댓글 정보
  var sql3 =  "SELECT post_id, state, user_id, comment_pw ,created, comment_content FROM COMMENT ";
      sql3 += "WHERE post_id = " + pageId + " ";

  var sql4 = "SELECT COUNT(*) FROM COMMENT WHERE post_id = " + pageId + " ";

    conn.query(sql4, function(err, result4){
      if (err) throw err;

      conn.query(sql3, function(err, result3){
          if(err) throw err;

        conn.query(sql2, function(err, result){
          if (err) throw err;
        conn.query(sql, function (err, result) {
          if (err) throw err;
          var msg = new Object();

          for(var i=0; i<result3.length; i++){
            result3[i].created = getFormDate(result3[i].created);
          }

          msg.comment = result3;
          msg.data = result;

          console.log("msg.comment 확인: ", msg.comment);
          console.log("msg.data 확인: ", msg.data);
          callback(msg);
          return
        });
      });
    });
  });
}

// 함수 목적: 날짜 포맷 맞추기
// 리턴 값: (올해)년 (올월)월 (금일)일
function getDataForm(created){
    var date = new Date(created);

    var year = date.getFullYear() + "년 ";
    var month = date.getMonth()+1 + "월 ";
    var day = date.getDate() + "일 ";

    return year + month + day;
    }

// 완성
// 글 삭제를 위한 함수
// 리턴 값: 없음
function deletePost(msg, callback){
  var pageId = msg.pageId;
  var sql = "DELETE FROM FREEBOARD ";
      sql +="WHERE num = "+ pageId;

  conn.query(sql, function (err, result) {
    if (err) throw err;
      callback(msg);
      return
  });
}

// 미완성
// 댓글을 불러오기 위한 함수
// 리턴값 미정
function getComment(pageId, callback){
  var pageId = msg.pageId;

  // 댓글의 정보를 객체속 배열로 불러옴
  var sql = "SELECT state, user_id, comment_pw ,created, comment_content FROM COMMENT ";
      sql += "ORDER BY COMMENT.created ASC" //최신 댓글부터 불러옴

      conn.query(sql, function (err, result) {
        if (err) throw err;
        var msg = new Object();

        msg.comment = comment;

        callback(comment);
        return
      });
}

// 미완성
// 댓글 작성을 위한 함수
// 리턴 값: 미정
function writeComment(msg, callback) {
  var pageId = msg.pageId;

  var sql = " ";
      sql += " ";
}
