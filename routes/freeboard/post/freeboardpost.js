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
    var result = msg.data;
    var comment = msg.comment;

    result.created = getDataForm(result.created);

    for(var i=0; i<comment.length; i++){
      comment[i].created = getDataForm(comment[i].created);
    }

    console.log(comment);

    res.render('freeboard/post/freeboardPost', {
      result: result, // 글 내용
      comment: comment, // 댓글 내용
      info: info,
      pageId: pageId
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
  } else if(flag == "deleteComment") {
    deleteComment(req.body, function(result){
      res.json(result);
    })
  }
});



// 완성
// 함수 이름: getPost
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
  var sql3 =  "SELECT post_id, state, user_id, comment_pw ,created, comment_content, comment_id FROM COMMENT ";
      sql3 += "WHERE post_id = " + pageId + " ";


  conn.query(sql3, function(err, comment_list){
    if(err) throw err;
    conn.query(sql2, function(err, view_update){
      if (err) throw err;
      conn.query(sql, function (err, post_info) {
        if (err) throw err;
        var msg = new Object();
        msg.comment = comment_list;
        msg.data = post_info[0];
        callback(msg);
        return
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

// 완성
// 댓글을 불러오기 위한 함수
// 리턴값 미정
function getComment(pageId, callback){
  var pageId = msg.pageId;

  // 댓글의 정보를 객체속 배열로 불러옴
  var sql = "SELECT state, user_id, comment_pw ,created, comment_content, comment_id FROM COMMENT ";
      sql += "ORDER BY COMMENT.created ASC" //최신 댓글부터 불러옴

      conn.query(sql, function (err, result) {
        if (err) throw err;
        var msg = new Object();

        msg.comment = comment;

        callback(comment);
        return
      });
}

// 완성
// 댓글 작성을 위한 함수
// 리턴 값: 미정
function writeComment(msg, callback) {
  var state = msg.state;
  var post_id = msg.post_id;
  var user_id = msg.user_id;
  var comment_pw = msg.comment_pw;
  var comment_content = msg.comment_content;
  /*
  var sql = `INSERT INTO COMMENT
             VALUES('${post_id}', '${state}',
                    '${user_id}', '${comment_pw}', NOW(),
                    '${comment_content}')`;
  */
  var sql = `INSERT INTO COMMENT(post_id, state, user_id, comment_pw, created, comment_content)
             VALUES('${post_id}', '${state}',
                    '${user_id}', '${comment_pw}', NOW(),
                    '${comment_content}')`;
      conn.query(sql, function (err, result) {
        if (err) throw err;
        callback(true);
        return
      });
}

function deleteComment(msg, callback) {
  var state = msg.state;
  var post_id = msg.post_id;

  var comment_id = msg.comment_id;

  var user_id = msg.user_id;

  var comment_pw = msg.comment_pw;

  var sql_pw = 'SELECT comment_pw from COMMENT WHERE comment_id = ' + comment_id + ' ';
  var sql_user = 'SELECT user_id from COMMENT WHERE comment_id = ' + comment_id + ' ';
  var sql_delete = 'DELETE FROM COMMENT WHERE comment_id = ' + comment_id + ' ';

  /*
  conn.query(sql_pw, function (err, result){
    if(err) throw err;

  });
  */
  console.log("sql쿼리문 실행전");
      conn.query(sql_pw, function(err, sql_pw_result){

          conn.query(sql_user, function (err, sql_user_result) {
            console.log("sql_user 실행 결과: ", sql_user_result[0].user_id);
            console.log("user_id: ", user_id);
            if(sql_user_result[0].user_id == user_id || sql_pw_result[0].comment_pw == comment_pw ){
            conn.query(sql_delete, function (err, result){
            callback(msg);
            return
            });
          }
        });
    });

    /* 원본 백업
    conn.query(sql_pw, function(err, result){
      if (err) throw err;
        conn.query(sql_user, function (err, result) {
          conn.query(sql_delete, function (err, result){
          callback(msg);
          return
          });
      });
  });
  */
}
