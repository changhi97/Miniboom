//webPush를 위한 key가져오기
require('dotenv').config({
  path: '.key/variables.env'
});

var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('../../public/javascripts/auth');
var conn = require('../../public/javascripts/mysql.js');

module.exports = function(io,socketUpload) {
  router.use(bodyParser.json());

  router.get('/', function(req, res, next) {
    info = auth.statusUI(req, res);
    res.render('index/index', info);
  });

  router.post('/register', (req, res) => {
    var info = auth.statusUI(req, res);

    const subscription = req.body
    console.log("----------index/register----------");
    console.log(subscription.subscription);
    console.log("----------index/register----------");
    set_pushinfo(info.nickname,subscription);
  });

  //공개키는 서버가 보내게 하자
  router.get('/vapidPublicKey', function(req, res) {
    const publicVapidKey = process.env.PUBLIC_VAPID_KEY;

    var key = {
      publicVapidKey: publicVapidKey,
      isSubscribed: true
    }

    /*if (req.session.temp_Id) {
      console.log("서버에서 알립니다. 비회원이라서 푸쉬 키발급 안됨요");
      key.publicVapidKey = false;
      res.json(key);
      return;
    }*/
    var info = auth.statusUI(req, res);

    //DB로 부터 구독정보와 구독 여부를 받아온다
    get_pushinfo(info.nickname,function(result) {
      if (result[0]['isSubscribed'] === 'true') {
        //result가 1이면 푸시알람을 받는다는 뜻이다.
        key.isSubscribed = true;
      }
      res.json(key);
    })
  });


  io.sockets.on('connection', function(socket) {
    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */

    /* 새로운 유저 접속시, 소켓 연결 */
    socket.on('newUser', function(data) {
      console.log("소켓아이디:",socket.id);
      var info = data;
      socket.name = info.nickname;
      socket.emit("newUser_response", info);
    })

    /* 새로운 유저 소켓 연결 확인시, 접속 알림 */
    socket.on("newUser_notice", function(data){
      var info = data;
      io.emit("newUser_notice", info);
    })

    /* 전송한 메시지 받기 */
    socket.on('message', function(data) {
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      var info = data;
      info.name = socket.name;
      info.type = "text";
      info.socketId = socket.id;
      io.emit('update', info);
    })

    /* 특정 사용자에게만 전송 */
    socket.on('only', function(data) {
      console.log("only");
      console.log(data);
      io.to(socketid).emit('only',data);
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {
      //console.log(socket.name + '님이 나가셨습니다.')
      /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
      socket.broadcast.emit('disconnection', {
        message: socket.name
      });
    })

    /*** file upload 를위함 ***/
    let uploader = new socketUpload();

    // @breif 업로드 경로를 지정
    uploader.dir = "file_store";

    uploader.listen(socket);

    // @breif 파일이 저장될 때 수행
    uploader.on("saved", function(event) {
      var data={
        name : socket.name,
        message:event.file.name,
        link : '/'+event.file.pathName,
        type : "file"
      }
      saveChat(data);
      io.emit('update', data);
    });

    // @breif 오류 처리
    uploader.on("error", function(event) {
      console.log("Error from uploader", event);
    });
    /*** file upload 를위함 ***/

  });
  /* 소켓통신 */

  return router;
}
function get_pushinfo(nickname,callback) {
  var sql = `SELECT isSubscribed,subscription FROM USER_INFO WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
    var isSubscribed = result[0]['isSubscribed'];
    var subscription = result[0]['subscription'];
    if(subscription !== null){
      subscription = JSON.parse(result[0]['subscription']);
    }
    console.log("----------GET subscription----------");
    console.log(isSubscribed);
    console.log(subscription);
    console.log("----------GET subscription----------");
    callback(result);
  });
}

function set_pushinfo(nickname,info) {
  var isSubscribed = info.isSubscribed;
  var subscription = JSON.stringify(info.subscription);
  console.log("----------PUSH subscription----------");
  console.log("isSubscribed : ", isSubscribed);
  console.log("subscription : ", subscription);
  console.log("----------PUSH subscription----------");
  var sql = `UPDATE USER_INFO SET isSubscribed='${isSubscribed}', subscription='${subscription}'
              WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
  });
}
