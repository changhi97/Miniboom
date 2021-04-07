var express = require('express');
var path = require('path');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
var bodyParser = require('body-parser');
var conn = require('../../public/javascripts/mysql.js');

/* parse : bodyParser */
router.use(bodyParser.json());

router.get('/', function(req, res) {
  var info = auth.statusUI(req, res);
  if (info.nickname !== undefined) { //info.state === Member
    nickname = info.nickname;
    getPushContent(nickname, function(result) {
      res.render("notice/notice", {
        data: result,
        info: info
      });
    })
  } else { //info.state === nonMember
    res.redirect('/')
  }
});

module.exports = router; //su_server를 다른 파일에서도 사용할수있기 하기위해?

function getPushContent(nickname, callback) {
  var sql = `SELECT sender, reciver, title, content, sender_state, DATE_FORMAT(push_time, '%Y-%m-%d    %h:%i %p') AS push_time FROM PUSH_NOTICE WHERE reciver = "${nickname}";`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    console.log("===notice page result===");
    console.log(result);
    console.log("===notice page result===");
    callback(result);
  });
}
