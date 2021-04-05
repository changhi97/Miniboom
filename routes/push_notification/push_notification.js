//webPush를 위한 key가져오기
require('dotenv').config({
  path: '.key/variables.env'
});

var express = require('express');
var path = require('path');
var router = express.Router();
var auth = require('../../public/javascripts/auth');
var bodyParser = require('body-parser');
var conn = require('../../public/javascripts/mysql.js');
var webPush = require('web-push');

/* parse : bodyParser */
router.use(bodyParser.json());

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

router.post('/', (req, res) => {
  var flag = req.body.flag;
  console.log(`너의 플래그는 ${flag}`);

  if (flag === 'push_test') {
    var info = req.body;
    var nickname = info.nickname;
    var title = info.title;
    var content = info.content;
    //테스트를 위해..
    if (nickname === "" || nickname === undefined) {
      console.log("name is undefined");
      return;
    }
    get_pushinfo(nickname, function(result) {
      if (result === undefined) {
        console.log(result);
        return;
      } else {
        var isSubscribed = result['isSubscribed'];
        var subscription = JSON.parse(result['subscription']);
        console.log(isSubscribed);
        if (isSubscribed === 'false') {
          console.log(`${nickname} IS push off`);
          return;
        } else {
          res.status(201).json({});
          const payload = JSON.stringify({
            title: title,
            body: content
          });
          webPush.sendNotification(subscription, payload).catch(error => console.error(error));
        }
      }
    })
  } else if (flag === "memo") {
    var info = req.body;
    var sender = info.sender;
    var reciver = info.reciver;
    var title = '-';
    var content = info.content;
    get_pushinfo(reciver, function(result) {
      if (result === undefined) {
        console.log("undefined이라는건 뭐다? 비회원이다~");
        res.send(false);
      } else {
        var isSubscribed = result['isSubscribed'];
        var subscription = JSON.parse(result['subscription']);
        if (isSubscribed === 'false') {
          console.log(`${reciver} is push OFF`);
        } else {
          console.log(`${reciver} is push ON`);
          const payload = JSON.stringify({
            title: `${sender} 님의 쪽지`,
            body: content
          });
          webPush.sendNotification(subscription, payload).catch(error => console.error(error));
        }
        //푸시허용 비허용에 상관없이 쪽지의 내용은 저장한다.(sender, reciver, title, content)
        savePushContent(sender, reciver, title, content);
        res.json(true);
      }
    })
  }
});

module.exports = router; //su_server를 다른 파일에서도 사용할수있기 하기위해?

function get_pushinfo(nickname, callback) {
  var sql = `SELECT isSubscribed,subscription FROM USER_INFO WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    console.log("-----push_TEST-----");
    if (result[0] === undefined) {
      console.log("비회원이라 쿼리문 undefined");
      callback(result[0]);
      return;
    }
    var isSubscribed = result[0]['isSubscribed'];
    var subscription = result[0]['subscription'];
    console.log(isSubscribed);
    console.log(subscription);
    console.log("-----push_TEST-----");
    console.log(result);
    console.log(result[0]);
    callback(result[0]);
  });
}

function savePushContent(sender, reciver, title, content) {
  //var sql = `SELECT sender, reciver, title, content FROM PUSH_NOTICE`
  var sql = `INSERT INTO PUSH_NOTICE(sender, reciver, title, content)
              VALUES ('${sender}', '${reciver}', '${title}', '${content}');`;
  conn.query(sql, function(err, result2) {
    if (err) throw err;
    console.log(`${sender} => ${reciver} : <${title} ${content}>`);
  });
}
