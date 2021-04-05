var express = require('express');
var router = express.Router();
var auth = require('../../../public/javascripts/auth');
const bodyParser = require('body-parser');
var app = express();
var conn = require('../../../public/javascripts/mysql');

/* parse : bodyParser */
router.use(bodyParser.json());
//app.set('trust proxy', true)

/* GET users listing. */
router.get('/', function(req, res, next) {
  var info = auth.statusUI(req,res);
  //freeboard direcotry -> freeboard.ejs
  res.render('freeboard/write/freeboardwrite', info);
  //res.getClientAddress(req);
});

router.post('/' , function(req, res, next){
  var flag = req.body['flag'];

  /* */
  if(flag == "addPoster"){
    var msg=req.body;
    var info = auth.statusUI(req, res);
    msg.nickname=info.nickname;
    freeboardAddPoster(msg, function(result){
      res.json(result);
    });
  }

});

/* passport에서 사용 */
// passport는 내부적을 session을 사용하기 때문에 session이 활성화되어있어야한다.
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

router.use(passport.initialize()); //express에 패스포트 미들웨어 설치
router.use(passport.session()); //패스포트는 내부적으로 세션을 사용


/*
 * 함수 이름: freeboardAddPoster
 * 함수 설명: 글 작성을 위한 쿼리 전달 함수
 */
function freeboardAddPoster(msg, callback){
  console.log("msg: ",msg);
  var title = msg.title;
  //var content = msg.content;
  var summernote = msg.summernote;
  var writer = msg.nickname;

  /*
  var sql = "INSERT INTO FREEBOARD(title, content, created, views, user_id)";
      sql +="VALUE ('"+title+"', '"+summernote+"', SYSDATE(), 0, ";
      sql +="(SELECT user_id FROM USER_INFO WHERE user_id='"+writer+"')";
      sql +=");";
  */
  //var sql = "INSERT INTO FREEBOARD(title, content, created, views, user_id)VALUES ('${data.name}', '${data.message}', '${link}', '${data.type}');

  var sql = `INSERT INTO FREEBOARD(title, content, created, views, user_id) VALUES ('${title}', '${summernote}', SYSDATE(), '${0}', '${writer}');`


  conn.query(sql, function (err, result) {
    if (err) throw err;
    callback(msg);
    return
  });
}



module.exports = router;
