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


/* 해시맵을 이용하여 사용자들의 socketId를 관리하기 위함이다*/
HashMap = function() {
  this.map = new Array();
};

HashMap.prototype = {
  put: function(key, value) {
    this.map[key] = value;
  },
  get: function(key) {
    return this.map[key];
  },
  getAll: function() {
    return this.map;
  },
  clear: function() {
    this.map = new Array();
  },
  getKeys: function() {
    var keys = new Array();
    for (i in this.map) {
      keys.push(i);
    }
    return keys;
  }
}

var index_chat_map = new HashMap();

module.exports = function(io) {
  router.use(bodyParser.json());
  router.get('/', function(req, res, next) {
    info = auth.statusUI(req, res);
    res.render('index/index', {
      info: info
    });
  });

  router.post('/register', (req, res) => {
    var info = auth.statusUI(req, res);

    const subscription = req.body
    // console.log("----------index/register----------");
    // console.log(subscription.subscription);
    // console.log("----------index/register----------");
    set_pushinfo(info.nickname, subscription);
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
    get_pushinfo(info.nickname, function(result) {
      // undefined가 될 때가 있음 if문 하나 더 만들어야할까? 21-05-13-AM 08:07
      if (result) {
        //result값이 존재하면 푸시알람을 받는다는 뜻이다.
        key.isSubscribed = true;
      } else {
        console.log("ERROR : isSubscribed undefined");
      }
      res.json(key);
    })
  });


  io.on('connection', function(socket) {
    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */

    /* 새로운 유저 접속시, 소켓 연결 */
    socket.on('newUser', function(data) {
      console.log("newUser: ", data);
      var info = data;
      socket.name = info.nickname;

      var chk = index_chat_map.get(info.nickname)
      if (!chk) {
        //이미 접속되어있는 아이디이면 알림x
        socket.emit("newUser_response", info);
      }
      //단 소켓 아이디만 갱신
      index_chat_map.put(info.nickname, socket.id);
      // console.log("ALL INDEX_CHAT USER");
      // console.log(index_chat_map.getAll());
    })

    /* 새로운 유저 소켓 연결 확인시, 접속 알림 */
    socket.on("newUser_notice", function(data) {
      var info = data;
      io.emit("newUser_notice", info);
    })

    /* 전송한 메시지 받기 */
    socket.on('message', function(data) {
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      var info = data;
      info.name = socket.name;
      info.type = "text";
      io.emit('update', info);
    })

    /* 특정 사용자에게만 전송 */
    socket.on('only', function(data) {
      //console.log("only server1: ",data);
      //console.log("only server2: ",index_chat_map.get(data.reciver));
      var reciver = index_chat_map.get(data.reciver);
      console.log(reciver);
      io.to(reciver).emit('only', data);
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {
      //console.log(socket.name + '님이 나가셨습니다.')
      /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
      //보내는 사람 받는 사람 socketid를 모두 알아야 한다.
      /*
      socket.broadcast.emit('disconnection', {
        message: socket.name
      });*/
    })
  });
  /* 소켓통신 */

  return router;
}

function get_pushinfo(nickname, callback) {
  var sql = `SELECT isSubscribed,subscription FROM USER_INFO WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) {
      console.log("get_pushinfo ERR(INDEX)");
    };
    try {
      var msg = new Object();
      var isSubscribed = result[0];
      var subscription = result[0];

      if (isSubscribed !== undefined) {
        isSubscribed = isSubscribed['isSubscribed'];
        msg.isSubscribed = subscription;
        if (subscription !== undefined) {
          subscription = JSON.parse(subscription['subscription']);
          msg.subscription = subscription;
          callback(msg);
        } else {
          callback(false);
        }
      } else {
        callback(false)
      }
    } catch {
      callback(false);
    }
  });
}

function set_pushinfo(nickname, info) {
  var isSubscribed = info.isSubscribed;
  var subscription = JSON.stringify(info.subscription);
  // console.log("----------PUSH subscription----------");
  // console.log("isSubscribed : ", isSubscribed);
  // console.log("subscription : ", subscription);
  // console.log("----------PUSH subscription----------");
  var sql = `UPDATE USER_INFO SET isSubscribed='${isSubscribed}', subscription='${subscription}'
              WHERE user_id = '${nickname}';`
  conn.query(sql, function(err, result) {
    if (err) throw err;
  });
}
