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
var crypto = require('crypto');
var HashMap = require('hashmap');

var index_chat_map = new HashMap();
var roomList = new HashMap(); //회원 아이디와 roomId저장
var roomMap = new HashMap(); //roomId와 비밀번호 저장
var roomMaster = new HashMap(); //roomId와 방장의 Id저장

module.exports = function(io, socketUpload) {
  router.use(bodyParser.json());

  router.get('/', function(req, res, next) {
    var info = auth.statusUI(req, res);
    var roomId = req.query.roomId
    var roomPSW = req.query.roomPSW
    var msg = {
      roomId: roomId,
      roomPSW: roomPSW,
      roomMaster: roomMaster.get(roomId),
      nickname: info.nickname,
      state: info.state
    }
    res.render('groupwork/groupworkV2', {
      info: msg
    });
  });

  //makeRoom : 사용자가 설정한 방 아이디와 비밀번호를 수신받고 임의의 접속링크 생성
  // 해시에 링크를 저장할지 key만을 저장할지 ? 링크는 카피할수있는 기능만 제공!
  router.post('/makeRoom', function(req, res, next) {
    var info = auth.statusUI(req, res);
    if (info.nickname === undefined) {
      res.json("NoMember");
    } else {
      var roomInfo = req.body;
      var roomId = roomInfo.roomId;
      var roomPSW = roomInfo.roomPSW;
      var nickname = roomInfo.nickname;
      var state = roomInfo.state;
      if (roomMap.get(roomId)) { //중복되는 roomId존재시 실패
        res.json(false);
      } else {
        roomMap.set(roomId, roomPSW);
        roomList.set(nickname, roomId);
        roomMaster.set(roomId, nickname);
        createTable(roomId, function() {
          res.json(true);
        })
      }
    }
  });

  router.post('/enterRoom', function(req, res, next) {
    var info = auth.statusUI(req, res);
    var roomInfo = req.body;
    var roomId = roomInfo.roomId;
    var roomPSW = roomInfo.roomPSW;
    var nickname = roomInfo.nickname;
    var state = roomInfo.state;
    var flag;
    var chk = roomMap.get(roomId);
    if (chk) { //방이 있는지 확인
      if (chk === roomPSW) {
        roomList.set(nickname, roomId);
        flag = true;
        res.json(flag);
      } else {
        flag = "psw"
        res.json(flag);
      }
    } else {
      flag = "room";
      res.json(flag);
    }
  });


  /* 소켓통신 */
  io.on('connection', function(socket) {
    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
    var roomId;
    /* 새로운 유저 접속시, 소켓 연결 */
    socket.on('newUser', function(data) {
      console.log("newUser: ", data);
      var info = data;
      socket.name = info.nickname;

      roomId = roomList.get(info.nickname);
      socket.join(roomId);
      loadChat(roomId, function(result) {
        io.in(roomId).emit("newUser_response", {
          info: info,
          preChat: result
        });
      })
      index_chat_map.set(info.nickname, socket.id);
    })

    /* 새로운 유저 소켓 연결 확인시, 접속 알림 */
    socket.on("newUser_notice", function(data) {
      var info = data;
      //io.emit("newUser_notice", {
      io.in(roomId).emit("newUser_notice", {
        info: info
      });
    })

    /* 전송한 메시지 받기 */
    socket.on('message', function(data) {
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      var info = data;
      info.name = socket.name;
      info.type = "text";
      info.link = null;

      saveChat(roomId, info)
      //io.emit('update', info);
      io.in(roomId).emit('update', info);
    })

    /* 특정 사용자에게만 전송 */
    socket.on('only', function(data) {
      //console.log("only server1: ",data);
      //console.log("only server2: ",index_chat_map.get(data.reciver));
      var reciver = index_chat_map.get(data.reciver);
      console.log(reciver);
      //io.to(reciver).emit('only', data);
      io.in(reciver).emit('only', data);
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {
      var arr = findClients(roomId);
      if(arr[0]===undefined){
        dropTable(roomId);
        roomList.delete(socket.name);
      }else{
        if(roomMaster.get(roomId)===socket.name){
          roomMaster.set(roomId,arr[0]);
          roomList.delete(socket.name);
        }else{
          roomList.delete(socket.name);
        }
      }
      console.log("배열");
      console.log(arr);
      socket.leave(roomId);
      io.in(roomId).emit('disconnection', {
        message: socket.name,
        newMaster : arr[0]
      });
    })

    /*** file upload 를위함 ***/
    let uploader = new socketUpload();

    // @breif 업로드 경로를 지정
    uploader.dir = "file_store";

    uploader.listen(socket);

    // @breif 파일이 저장될 때 수행
    uploader.on("saved", function(event) {
      var data = {
        name: socket.name,
        message: event.file.name,
        link: '/' + event.file.pathName,
        type: "file"
      }
      saveChat(roomId, data);
      io.in(roomId).emit('update', data);
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

//목적 : 룸 채팅의 내용을 디비에 저장하는 함수
function saveChat(roomId, data) {
  var link = JSON.stringify(data.link);
  var table = roomId + "DB";
  var sql = `INSERT INTO ` + table + ` (user_id, chat_data, file_link, data_type)
              VALUES ('${data.name}', '${data.message}', '${link}', '${data.type}');`
  conn.query(sql, function(err, result2) {
    if (err) throw err;
    console.log("DB SAVE", data.name, data.message, data.type);
  });
}

//목적 : 룸 채팅시 저장된 데이터를 불러오는 함수
function loadChat(roomId, callback) {
  // 최근 채팅 내용 100개 까지 불러옴 at 2021-02-23
  //최근 100개출력안됨 at 2021-02-26
  var table = roomId + "DB";
  var sql = "SELECT user_id, chat_data, DATE_FORMAT(chat_time, '%h:%i %p') AS chat_time, file_link, data_type"
  sql += " FROM " + table + " WHERE DATE(chat_time) = DATE(NOW());"
  conn.query(sql, function(err, result) {
    if (err) throw err;
    for (var index in result) {
      var data = result[index];
      console.log("DB LOAD", data['user_id'], data['chat_data'], data['file_link'], data['data_type']);
    }
    callback(result);
  });
}

//룸 채팅을위한 테이블 생성
function createTable(roomId, callback) {
  var table = roomId + "DB"
  var sql = "CREATE TABLE `" + table + "`(`user_id` VARCHAR(30) NOT NULL,"
  sql += "`chat_data` VARCHAR(1000),"
  sql += "`chat_time` DATETIME DEFAULT NOW(),"
  sql += "`file_link` varchar(500) DEFAULT NULL,"
  sql += "`data_type` varchar(10) NOT NULL);"

  conn.query(sql, function(err, result) {
    if (err) {
      throw err;
    }
    callback();
  });
}

//룸 채팅이 끝날경우 데이블 삭제
function dropTable(roomId) {
  var table = roomId + "DB";
  console.log("드랍");
  console.log(table);
  console.log("드랍");
  "CREATE TABLE `" + table + "`(`user_id` VARCHAR(30) NOT NULL,"
  var sql = "DROP TABLE `" + table + "`;";
  conn.query(sql, function(err, result) {
    if (err) {
      throw err;
    }
  });
}

//목적 : (미완)방장이 떠날시 다른사람을 방장으로 위임하기 위한 함수
function newMaster() {
  var temp = roomList.entries();
  console.log(temp);
}

function findClients(roomId) {
  var keyArr = roomList.keys();
  var key;
  var res = new Array();
  console.log("클라 반복");
  for (index in keyArr) {
    key = keyArr[index];
    console.log(key);
    console.log(roomList.get(key));
    if (roomId === roomList.get(key)) {
      res.push(key);
    }
  }
  console.log("클라 반복");
  return res;
}
