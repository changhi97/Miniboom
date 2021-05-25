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
//var roomList = new HashMap(); //회원 아이디와 roomId저장
//var roomMap = new HashMap(); //roomId와 비밀번호 저장
//var roomMaster = new HashMap(); //roomId와 방장의 Id저장

module.exports = function(io, socketUpload) {
  router.use(bodyParser.json());

  router.get('/', function(req, res, next) {
    var info = auth.statusUI(req, res);
    var roomId = req.query.roomId
    var roomPSW = req.query.roomPSW
    var msg = {
      roomId: roomId,
      roomPSW: roomPSW,
      nickname: info.nickname,
      state: info.state
    }
    roomMemberALL(msg, function(data) {
      if (data.result) {
        res.render('groupwork/groupwork', {
          info: msg,
          memberList: data.allUser
        });
      } else {
        res.redirect('/');
      }
    })
  });

  //makeRoom : 사용자가 설정한 방 아이디와 비밀번호를 수신받고 임의의 접속링크 생성
  // 해시에 링크를 저장할지 key만을 저장할지 ? 링크는 카피할수있는 기능만 제공!
  router.post('/makeRoom', function(req, res, next) {
    console.log("MAKEROOM POST");
    var info = auth.statusUI(req, res);
    if (info.state === "Member") {
      createRoom(req, function(msg) {
        if (msg.result) {
          registMember(msg.data, function(result) {
            if (result) {
              res.json(true);
            } else {
              console.log("ERROR: MEMBER 등록 실패")
              res.json(false);
            }
          })
        } else {
          console.log("ERROR: Room 생성 실패")
          res.json(false);
        }
      });
    } else {
      console.log("ERROR: MEMBER 아님")
      res.json("NoMember");
    }
  });

  router.post('/enterRoom', function(req, res, next) {
    console.log("ENTERROOM POST");
    var info = auth.statusUI(req, res);
    if (info.state === "Member") {
      findRoom(req, function(msg) {
        if (msg.result) { //방이 존재한다.(비밀번호까지 일치)
          registMember(msg.data, function(result) { //룸 입장전 정보 등록
            if (result) {
              res.json(true);
            } else {
              console.log("ERROR: MEMBER 등록 실패")
              res.json(false);
            }
          })
        } else {
          console.log("ERROR: Room 정보가 불일치")
          res.json(false);
        }
      });
    } else {
      console.log("ERROR: MEMBER 아님")
      res.json("NoMember");
    }
  });

  router.post('/roomOut', function(req, res, next) {
    var info = auth.statusUI(req, res);
    var roomId = req.body.roomId;
    var userId = req.body.nickname;
    var data = {
      roomId: roomId,
      userId: userId
    }
    roomOutMember(data, function(result) {
      if (result) {
        roomMember(data, function(result2) {
          if (result2.master) { //MASTER find
            newMaster(data, function(result3) {
              if (result3) {
                res.json(true);
              } else {
                console.log("ERROR: 방장 위임 실패!");
                res.json(false);
              }
            })
          } else { //MASTER undefined
            deleteRomm(data, function(result4) {
              if (result4) {
                res.json(true);
              } else {
                console.log("ERROR: 룸 삭제 실패!");
                res.json(false);
              }
            })
          }
        })
      } else {
        console.log("ERROR: 나가기 실패!");
        res.json(false);
      }
    })
  });

  router.post('/todoList', function(req, res, next) {
    var info = auth.statusUI(req, res);
    var msg = req.body;
    var flag = msg.flag;
    if (flag === "set") {
      setToDoList(msg, function(result) {
        if (result) {
          res.json(result);
        } else {
          res.json(false);
        }
      })
    } else if (flag === "get") {
      getToDoList(msg, function(result) {
        if (result) {
          res.json(result);
        } else {
          res.json(false);
        }
      })
    } else if (flag === "myList_delete") {
      deleteMyToDoList(msg, function(result) {
        if (result) {
          res.json(result);
        } else {
          res.json(false);
        }
      })
    }
  });

  /* 소켓통신 */
  io.on('connection', function(socket) {
    /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
    console.log("ROOM CONNEXTION");
    var roomId;
    /* 새로운 유저 접속시, 소켓 연결 */

    socket.on('newUser', function(data) {
      console.log("Room newUser");
      console.log(data);
      var info = data;
      socket.name = info.nickname;
      roomId = data.roomId;

      loadToDo(data, function(todo) {
        if (todo) {
          loadChat(roomId, function(result) {
            socket.emit("newUser_response", { //나에게만
              info: info,
              preChat: result,
              work: todo
            });
          })
        } else {
          console.log("ERROR : loadToDo ERROR");
        }
      })


      socket.join(roomId);
      index_chat_map.set(info.nickname, socket.id);
    })

    /* 새로운 유저 소켓 연결 확인시, 접속 알림 */
    socket.on("newUser_notice", function(data) {
      console.log("ROOM NOTICE");
      console.log(data);
      var info = data;
      var chk = index_chat_map.get(info.nickname);
      socket.broadcast.to(roomId).emit("newUser_notice", info);
    })

    socket.on("update_list", function(data) {
      console.log("ROOM update_list");
      console.log(data);
      var info = data;
      getWithList(info,function(result){
        socket.broadcast.to(roomId).emit('update_list', result);
      })
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
      io.to(roomId).emit('update', info);
    })

    /* 특정 사용자에게만 전송 */
    socket.on('only', function(data) {
      //console.log("only server1: ",data);
      //console.log("only server2: ",index_chat_map.get(data.reciver));
      var reciver = index_chat_map.get(data.reciver);
      console.log(reciver);
      //io.to(reciver).emit('only', data);
      io.to(reciver).emit('only', data);
    })

    /* ToDoList 등록시키기위함 */
    socket.on('register_ToDoList', function(data) {
      console.log(data);
      io.to(roomId).emit('register_ToDoList', data);
    })

    /* ToDoList의 참여자를 등록시키기위함 */
    socket.on('with_ToDoList', function(data) {
      console.log("with_ToDoList");
      console.log(data);
      io.to(roomId).emit('with_ToDoList', data);
    })

    /* ToDoList의 참여자를 삭제키기위함 */
    socket.on('remove_AllToDoListUser', function(data) {
      console.log("remove_AllToDoListUser");
      console.log(data);
      io.to(roomId).emit('remove_AllToDoListUser', data);
    })
    /* 접속 종료 */
    socket.on('disconnect', function() {
      socket.broadcast.to(roomId).emit('disconnection', {
        nickname: socket.name
      });
      /*var msg  = {
        userId : socket.name
      }
      roomOutMember(msg, function(result) {
        socket.broadcast.to(roomId).emit('disconnection', {
          nickname: socket.name
        });
      })*/
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
      console.log("SAVE FILE");
      console.log(data);
      console.log("SAVE FILE");
      saveChat(roomId, data);
      io.to(roomId).emit('update', data);
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
  var sql = `INSERT INTO CHAT (user_id, chat_data, file_link, data_type, roomId)
            VALUES('${data.name}', '${data.message}', '${link}', '${data.type}', '${roomId}');`
  conn.query(sql, function(err, result2) {
    if (err) throw err;
    //console.log("DB SAVE", data.name, data.message, data.type);
  });
}

//목적 : 룸 채팅시 저장된 데이터를 불러오는 함수
function loadChat(roomId, callback) {
  // 최근 채팅 내용 100개 까지 불러옴 at 2021-02-23
  //최근 100개출력안됨 at 2021-02-26
  var sql = `SELECT user_id, chat_data, DATE_FORMAT(chat_time, '%h:%i %p') AS chat_time, file_link, data_type FROM CHAT WHERE roomId='${roomId}';`;
  conn.query(sql, function(err, result) {
    if (err) throw err;
    for (var index in result) {
      var data = result[index];
      //console.log("DB LOAD", data['user_id'], data['chat_data'], data['file_link'], data['data_type']);
    }
    callback(result);
  });
}

//목적 : 룸 채팅시 저장된 데이터를 불러오는 함수
function loadToDo(data, callback) {
  //work 테이블에서 roomId로 todo,num를 들고온다
  //part 테이블에서 rooId, userId로 num을 들고오고 work에서 num으로 todo를 들고온다
  var msg = new Object();
  var allNum = new Array();
  var allToDo = new Array();
  var myNum = new Array();
  var myToDo = new Array();
  var myUserId = new Array();
  var roomId = data.roomId;
  var userId = data.nickname;

  var sql = `SELECT num, todo FROM WORK WHERE roomId = '${roomId}';`;
  conn.query(sql, function(err, result) {
    if (err) {
      callback(false);
    } else {
      console.log("GET DATA FROM WORK");
      for (index in result) {
        allNum[index] = result[index].num;
        allToDo[index] = result[index].todo;
        console.log(result[index]);
      }
      msg.allNum = allNum;
      msg.allToDo = allToDo;
      var sql = `SELECT num, todo, userId FROM PART WHERE roomId='${roomId}' AND userId='${userId}';`;
      conn.query(sql, function(err, result) {
        if (err) {
          callback(false);
        } else {
          console.log("GET DATA FROM PART");
          for (index in result) {
            myNum[index] = result[index].num;
            myToDo[index] = result[index].todo;
            myUserId[index] = result[index].userId;
            console.log(result[index]);
          }
          msg.myNum = myNum;
          msg.myToDo = myToDo;
          msg.myUserId = myUserId;
          callback(msg);
        }
      });
    }
  });
}


//ALL LIST에
function getWithList(data,callback){
  var roomId = data.info.roomId;
  var withUserId = new Array();
  var withNum = new Array();
  var msg = new Object();

  var sql = `SELECT num, userId FROM PART WHERE roomId = '${roomId}';`;
  conn.query(sql, function(err, result) {
    if (err) {
      callback(false);
    } else {
      console.log("getWithList");
      console.log(result);
      for (index in result) {
        withUserId[index] = result[index].userId;
        withNum[index] = result[index].num;
      }
      msg.withUserId=withUserId;
      msg.withNum=withNum;
      callback(msg);
    }
  });
}

function createRoom(req, callback) {
  try {
    // Room 생성을 시도
    var msg = new Object();

    var roomInfo = req.body;
    var roomId = roomInfo.roomId;
    var roomPSW = roomInfo.roomPSW;
    var roomMaster = roomInfo.nickname;
    var state = roomInfo.state;

    var sql = `INSERT INTO ROOM VALUES ('${roomId}','${roomPSW}','${roomMaster}');`
    conn.query(sql, function(err, result) {
      if (err) { // SQL 문법 에러
        msg.result = false;
        msg.data = null;
        callback(false)
      } else { // ROOM 생성 성공
        var data = new Object();
        data.roomId = roomId;
        data.userId = roomMaster;
        msg.result = true;
        msg.data = data;
        callback(msg)
      }
    });
  } catch (error) {
    callback(msg)
  }
}

//룸 아이디, 비밀번호와 일치하는 룸이 있는지 확인
function findRoom(req, callback) {
  try {
    // Room 생성을 시도
    var msg = new Object();
    var roomInfo = req.body;
    var roomId = roomInfo.roomId;
    var roomPSW = roomInfo.roomPSW;
    var userId = roomInfo.nickname;

    //var sql = `SELECT roomId FROM ROOM WHERE roomId = '${roomId}';`
    var sql = `SELECT roomId FROM ROOM WHERE roomId = '${roomId}' AND roomPSW = '${roomPSW}';`
    conn.query(sql, function(err, result) {
      if (err) { // SQL 문법 에러
        msg.result = false;
        callback(msg)
      } else { // ROOM 생성 성공
        if (result[0] === undefined) {
          msg.result = false;
          callback(msg)
        } else {
          var data = new Object();
          data.roomId = roomId;
          data.userId = userId;
          msg.result = true;
          msg.data = data;
          callback(msg)
        }
      }
    });
  } catch (error) {
    callback(msg)
  }
}

function registMember(data, callback) {
  var roomId = data.roomId;
  var userId = data.userId;

  var sql = `SELECT userId FROM ROOM_MEMBER WHERE roomId = '${roomId}' AND userId = '${userId}';`
  conn.query(sql, function(err, result) {
    if (err) { // SQL 문법 에러
      callback(false);
    } else { // ROOM 생성 성공
      if (result[0] === undefined) {
        var sql = `INSERT INTO ROOM_MEMBER VALUES ('${roomId}','${userId}');`
        conn.query(sql, function(err, result) {
          if (err) { // SQL 문법 에러
            callback(false);
          } else { // ROOM 생성 성공
            callback(true);
          }
        });
      } else {
        callback(true);
      }
    }
  });
}

function getCookieMap(cookieString) {
  var elements = cookieString.split(' ');
  var cookieMap = new HashMap();
  for (var index in elements) {
    var element = elements[index].split("=");
    var key = element[0];
    var value = element[1].replace(";", '');
    cookieMap.set(key, value);
  }
  return cookieMap;
}

//룸에 아무도 없을시 룸 삭제 밑 list 삭제
function deleteRomm(data, callback) {
  var roomId = data.roomId;
  var sql = `DELETE FROM WORK WHERE roomId= '${roomId}';`;
  var msg = new Object();
  conn.query(sql, function(err, result) {
    if (err) {
      msg.result = false;
      callback(msg);
    } else {
      var sql = `DELETE FROM PART WHERE roomId= '${roomId}';`;
      var msg = new Object();
      conn.query(sql, function(err, result) {
        if (err) {
          msg.result = false;
          callback(msg);
        } else {
          var sql = `DELETE FROM ROOM WHERE roomId= '${roomId}';`;
          conn.query(sql, function(err, result) {
            if (err) {
              msg.result = false;
              callback(msg);
            } else {
              var sql = `DELETE FROM WORK WHERE roomId= '${roomId}';`;
              conn.query(sql, function(err, result) {
                if (err) {
                  msg.result = false;
                  callback(msg);
                } else {
                  var sql = `DELETE FROM PART WHERE roomId= '${roomId}';`;
                  conn.query(sql, function(err, result) {
                    if (err) {
                      msg.result = false;
                      callback(msg);
                    } else {
                      msg.result = true;
                      callback(msg);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

//멤버가 방에서 나갈시 테이블에서 유저 정보 삭제
function roomOutMember(data, callback) {
  var userId = data.userId;
  var sql = `DELETE FROM ROOM_MEMBER WHERE userId= '${userId}';`;
  var msg = new Object();
  conn.query(sql, function(err, result) {
    if (err) {
      msg.result = false;
      callback(msg);
    } else {
      msg.result = true;
      callback(msg);
    }
  });
}

//룸 아이디에 해당하는 멤버정보를 얻기위한 함수
function roomMember(data, callback) {
  var roomId = data.roomId;
  var sql = `SELECT userId FROM ROOM_MEMBER WHERE roomId='${roomId}';`;
  var msg = new Object();
  conn.query(sql, function(err, result) {
    if (err) {
      msg.result = false;
      callback(msg);
    } else {
      try {
        msg.result = true;
        msg.master = result[0].userId;
        callback(msg);
      } catch (error) {
        msg.master = false;
        callback(msg)
      }

    }
  });
}

//룸 아이디에 해당하는 "모든" 멤버정보를 얻기위한 함수
function roomMemberALL(data, callback) {
  var roomId = data.roomId;
  var sql = `SELECT userId FROM ROOM_MEMBER WHERE roomId='${roomId}';`;
  var msg = new Object();
  var allUser = new Array();
  conn.query(sql, function(err, result) {
    if (err) {
      msg.result = false;
      callback(msg);
    } else {
      try {
        msg.result = true;
        for (index in result) {
          allUser[index] = result[index].userId;
        }
        msg.allUser = allUser;
        callback(msg);
      } catch (error) {
        msg.result = false;
        msg.allUser = allUser;
        callback(msg)
      }
    }
  });
}

function newMaster(data, callback) {
  var roomId = data.roomId;
  var userId = data.userId;
  var sql = `UPDATE ROOM SET roomMaster = '${userId}' WHERE roomId = '${roomId}';`;
  var msg = new Object();
  conn.query(sql, function(err, result) {
    if (err) {
      msg.result = false;
      callback(msg);
    } else {
      msg.result = true;
      callback(msg);
    }
  });
}

//todo list정보를 DB에 저장
function setToDoList(msg, callback) {
  console.log("setToDoList");
  console.log(msg);
  var work = msg.work;
  var uerId = msg.userId;
  var roomId = msg.roomId;

  var sql0 = `SELECT todo FROM WORK WHERE todo='${work}' AND roomId='${msg.roomId}';`;
  conn.query(sql0, function(err, result) {
    if (err) { // SQL 문법 에러
      callback(false);
    } else {
      if (result[0]) {
        callback(false);
      } else {
        var sql1 = `INSERT INTO WORK (todo, roomId) VALUES ('${work}','${roomId}');` //todo를 디비에 저장
        conn.query(sql1, function(err, result) {
          if (err) { // SQL 문법 에러
            callback(false);
          } else {
            var sql2 = `SELECT num FROM WORK WHERE todo='${work}';`; //todo의 아이디를 get
            conn.query(sql2, function(err, result2) {
              if (err) { // SQL 문법 에러
                callback(false);
              } else {
                msg.num = result2[0].num;
                callback(msg);
              }
            });
          }
        });
      }
    }
  });
}

//todo list정보를 DB에서 가져온다
function getToDoList(msg, callback) {
  console.log("getToDoList");
  console.log(msg);
  var userId = msg.userId;
  var num = msg.num;
  var roomId = msg.roomId;

  var sql = `SELECT todo FROM WORK WHERE num='${num}';`; //아이디와 사용자를 등록
  conn.query(sql, function(err, result) {
    if (err) { // SQL 문법 에러
      callback(false);
    } else {
      var todo = result[0].todo;
      var sql = `INSERT INTO PART VALUES ('${num}','${userId}','${roomId}','${todo}');` //아이디와 사용자를 등록
      conn.query(sql, function(err, result) {
        if (err) { // SQL 문법 에러
          callback(false);
        } else {
          var sql = `SELECT todo FROM WORK WHERE num='${num}';`; //아이디와 사용자를 등록
          conn.query(sql, function(err, result) {
            if (err) { // SQL 문법 에러
              callback(false);
            } else {
              msg.work = result[0].todo;
              callback(msg)
            }
          });
        }
      });
    }
  });

}

function deleteMyToDoList(msg, callback) {
  console.log("deleteMyToDoList");
  console.log(msg);
  var sql = `DELETE FROM PART WHERE num='${msg.num}' AND userId='${msg.userId}';`;
  conn.query(sql, function(err, result) {
    if (err) { // SQL 문법 에러
      callback(false);
    } else {
      callback(msg);
    }
  });
}
