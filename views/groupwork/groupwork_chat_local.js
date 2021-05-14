var socket = io('/groupwork');
let siofu = new SocketIOFileUpload(socket);

/*
 *
 */
function startSocket() {
  connect();
  newUser_response();
  newUser_notice();
  update();
  onlyYou();
  register_ToDoList();
  with_ToDoList();
  remove_AllToDoListUser();
  disconnect();
  document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
}


/* 접속 되었을 때 실행 */
function connect() {
  socket.on('connect', function() {
    var info = new Object();
    info.nickname = getCookie("nickname");
    info.state = getCookie("state");
    info.roomId = $('#roomId').val();
    console.log("clients room chat connect info");
    console.log(info);
    socket.emit('newUser', info);
  })
}

function newUser_response() {
  socket.on('newUser_response', function(data) {
    var info = data.info
    var work= data.work;
    console.log('newUser_response: ', info);

    var nickname = getCookie("nickname"); //현재 접속한 유저의 아이디 data의 nickname과 비교하기위함
    for (var index in data.preChat) {
      var load_data = data.preChat[index];
      //console.log(load_data);
      //로드 데이터가 text일 경우
      if (load_data.data_type === "text") {
        var chat = document.getElementById('chat');
        var message = document.createElement('div');
        var name = document.createElement('a');
        var content = document.createElement('div');
        var time = document.createElement('div');
        name.setAttribute("class", "chat_name");
        content.setAttribute("class", "chat_content");
        time.setAttribute("class", "chat_time");

        var name_Node = document.createTextNode(`${load_data.user_id}`);
        var content_Node = document.createTextNode(`${load_data.chat_data}`);
        var time_Node = document.createTextNode(`-${load_data.chat_time}-`);

        var className = 'me';
        if (nickname !== load_data.user_id) {
          className = 'you';
          name.addEventListener('click', function() {
            openModal(load_data.user_id);
          });
        }

        message.classList.add(className);
        name.appendChild(name_Node);
        content.appendChild(content_Node);
        time.appendChild(time_Node);
        message.appendChild(name);
        message.appendChild(content);
        message.appendChild(time);
        chat.appendChild(message);

        messageModal(className, message, name, load_data.user_id);
        // console.log(message);
        // console.log(time);
      }
      //전송받은 데이터가 file일 경우
      else {
        var file_link = load_data.file_link;
        file_link = file_link.replaceAll('"', '');

        var chat = document.getElementById('chat');
        var message = document.createElement('div');
        var name = document.createElement('div');
        var content = document.createElement('div');
        var time = document.createElement('div');
        name.setAttribute("class", "chat_name");
        content.setAttribute("class", "chat_content");
        time.setAttribute("class", "chat_time");

        var name_Node = document.createTextNode(`${load_data.user_id}`);
        var content_Node = document.createElement('a');
        var file_img = document.createElement('img');
        var time_Node = document.createTextNode(`-${load_data.chat_time}-`);

        content_Node.setAttribute('href', file_link);
        content_Node.innerText = `${load_data.chat_data}`;
        content_Node.setAttribute('download', `${load_data.chat_data}`);
        file_img.setAttribute("src", "/images/file_icon.svg");

        var className = 'me';
        if (nickname !== load_data.user_id) {
          className = 'you';
          name.addEventListener('click', function() {
            openModal(load_data.user_id);
          });
        }

        message.classList.add(className);
        name.appendChild(name_Node);
        content.appendChild(file_img);
        content.appendChild(content_Node);
        time.appendChild(time_Node);
        message.appendChild(name);
        message.appendChild(content);
        message.appendChild(time);
        chat.appendChild(message);

        messageModal(className, message, name, load_data.user_id);
      }
    }

    console.log('newUser_response: ', work.allNum);
    console.log('newUser_response: ', work.myNum);
    for(index in work.allNum){
      var msg = {
        num : work.allNum[index],
        work : work.allToDo[index]
      }
      createALLtodoList(msg);
    }

    for(index in work.myNum){
      var msg={
        userId :work.myUserId[index],
        num :work.myNum[index],
        work : work.myToDo[index]
      }
      createMYtodoList(msg);
    }
    socket.emit('newUser_notice', info);
  })
}

/*
 * 유저 입장시 입장 알림메시지 출력
 */
function newUser_notice() {
  socket.on('newUser_notice', function(data) {
    console.log("newUser_notice client");
    console.log(data);
    var info = data;

    /*MEMBER INDEX 추가*/
    var memberIndex = document.getElementById('memberIndex');
    var member = document.createElement('div');
    member.setAttribute("class", `member ${info.nickname}`);
    member.innerHTML = info.nickname;
    memberIndex.appendChild(member);
    /*MEMBER INDEX 추가*/

    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  })
}

function disconnect() {
  socket.on('disconnection', function(data) {
    console.log("Clients disconnection");
    console.log(data);

    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.nickname} 님이 나가셨습니다.`)
    var className = 'newUser-notice'

    //document.getElementById('memberIndex').classList.remove(`member ${data.nickname}`);
    var deleteList = document.getElementsByClassName(`member ${data.nickname}`);
    for (var i = 0; i < deleteList.length; i++) {
      deleteList[i].remove();
    }

    // 스크롤바 맨 아래로
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  });
}

/*
 * 서버로부터 데이터 받은 경우
 */
function update() {
  socket.on('update', function(data) {
    //전송받은 데이터가 text일 경우
    if (data.type === "text") {
      console.log("데이터 text: ", data);

      var today = new Date();
      var hours = today.getHours(); // 시
      var minutes = today.getMinutes(); // 분
      var localtime = `${hours} : ${minutes}`;
      var nickname = getCookie("nickname");

      var chat = document.getElementById('chat');
      var message = document.createElement('div');
      var name = document.createElement('div');
      var content = document.createElement('div');
      var time = document.createElement('div');
      name.setAttribute("class", "chat_name");
      content.setAttribute("class", "chat_content");
      time.setAttribute("class", "chat_time");

      var name_Node = document.createTextNode(`${data.name}`);
      var content_Node = document.createTextNode(`${data.message}`);
      var time_Node = document.createTextNode(`-${localtime}-`);

      var className = 'me';
      if (nickname !== data.name) {
        className = 'you';
        name.addEventListener('click', function() {
          openModal(data.name);
        });
      }

      message.classList.add(className);
      name.appendChild(name_Node);
      content.appendChild(content_Node);
      time.appendChild(time_Node);
      message.appendChild(name);
      message.appendChild(content);
      message.appendChild(time);
      chat.appendChild(message);


      // 스크롤바 맨 아래로
      $("#chat").scrollTop($("#chat")[0].scrollHeight);
      $("#test").focus();
    }

    // 전송받은 데이터가 file일 경우
    else {
      console.log("데이터 file: ", data);

      var file_link = data.link;
      file_link = file_link.replaceAll('"', '');

      var today = new Date();
      var hours = today.getHours(); // 시
      var minutes = today.getMinutes(); // 분
      var localtime = `${hours} : ${minutes}`;
      var nickname = getCookie("nickname");

      var chat = document.getElementById('chat');
      var message = document.createElement('div');
      var name = document.createElement('div');
      var content = document.createElement('div');
      var time = document.createElement('div');

      name.setAttribute("class", "chat_name");
      content.setAttribute("class", "chat_content");
      time.setAttribute("class", "chat_time");

      var name_Node = document.createTextNode(`${data.name}`);
      var content_Node = document.createElement('a');
      var file_img = document.createElement('img');
      var time_Node = document.createTextNode(`-${localtime}-`);

      content_Node.setAttribute('href', file_link);
      content_Node.innerText = `${data.message}`;
      content_Node.setAttribute('download', `${data.message}`);
      file_img.setAttribute("src", "/images/file_icon.svg");


      var className = 'me';
      if (nickname !== data.name) {
        className = 'you';
        name.addEventListener('click', function() {
          openModal(data.name);
        });
      }

      message.classList.add(className);
      name.appendChild(name_Node);
      content.appendChild(file_img);
      content.appendChild(content_Node);
      time.appendChild(time_Node);
      message.appendChild(name);
      message.appendChild(content);
      message.appendChild(time);
      chat.appendChild(message);

      messageModal(className, message, name, data.name);

      // 스크롤바 맨 아래로
      $("#chat").scrollTop($("#chat")[0].scrollHeight);
      $("#test").focus();
    }
  });
}

/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById('test').value

  //공백일 경우 전송 불가
  if (message.trim().length === 0) return;

  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById('test').value = ''

  $("#chat").scrollTop($("#chat")[0].scrollHeight);
  $("#test").focus();

  // 서버로 message 이벤트 전달 + 데이터와 함께
  socket.emit('message', {
    message: message
  });
}

function onlyYou() {
  socket.on('only', function(data) {
    console.log("only local");
    console.log(data);
    var memo = document.getElementById('memo');
    var memo_content = document.createElement('div');
    memo_content.setAttribute("class", "memo_content");
    memo_content.innerHTML = data.sender + "</br>" + data.content;
    memo.appendChild(memo_content);
    memo_content.addEventListener('click', function() {
      openReadModal(data);
    });
  });
}

function register_ToDoList() {
  socket.on('register_ToDoList', function(msg) {
    console.log("register_ToDoList");
    console.log(msg);
    createALLtodoList(msg);
  });
}

function with_ToDoList() {
  socket.on('with_ToDoList', function(msg) {
    console.log("with_ToDoList");
    console.log(msg);
    addWith(msg);
  });
}

function remove_AllToDoListUser() {
  socket.on('remove_AllToDoListUser', function(msg) {
    console.log("remove_AllToDoListUser");
    console.log(msg);
    var curr = document.getElementById(msg.num);
    var parent = curr.parentNode;
    var findWith = parent.getElementsByClassName('with');
    var userId = msg.userId;
    for (var i = 0; i < findWith.length; i++) {
      var findUser = findWith[i].innerText.trim('');
      console.log(i);
      console.log(userId);
      console.log(findUser);
      console.log(userId == findUser);
      if (msg.userId == findUser) {
        console.log("삭제한다?");
        findWith[i].remove();
      }
    }
  });
}

function sendMemo() {
  var reciver = $("#message-target").val();
  var sender = $('#nickname').val();
  var content = $("#poster-content").val();
  $("#poster-content").val('');

  if (reciver == undefined || content.trim().length === 0) return;

  var msg = {
    flag: "memo",
    reciver: reciver,
    sender: sender,
    content: content
  }
  console.log("sendMemo: ", msg);
  $.ajax({
    type: "POST",
    url: "/push_Notification",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log("result", result);
      closeModal();
    }
  });
  socket.emit('only', msg);
}

function openModal(name) {
  $("#messageModal").css("display", "block");
  $("#sendMessage").css("display", "block");
  $("#replyMessage").css("display", "none");
  $("#message-target").text(name);
  $("#message-target").val(name);
  $("#poster-content").val('');
  $("#poster-content").attr("readonly", false);
}

function openReadModal(data) {
  console.log("openReadModal", data);
  $("#messageModal").css("display", "block");
  $("#sendMessage").css("display", "none");
  $("#replyMessage").css("display", "block");
  $("#message-target").text(data.sender);
  $("#message-target").val(data.sender);
  $("#poster-content").val(data.content);
  $("#poster-content").attr("readonly", true);
}

function replyMemo() {
  var name = $("#message-target").val();
  openModal(name);
}

function closeModal() {
  $("#messageModal").css("display", "none");
}

function addAllList() {
  var work = $('.AddList').val();
  if (work.trim().length === 0) return;
  var userId = getCookie("nickname");
  var roomId = $('#roomId').val();
  var msg = {
    flag: "set",
    work: work,
    userId: userId,
    roomId: roomId
  }
  $.ajax({
    type: "POST",
    url: "/groupwork/todoList",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      closeListModal();
      if (result) {
        socket.emit('register_ToDoList', result);
      } else {
        alert("동일한 작업이 존재합니다!");
      }
    }
  });
}

function addMyList(workId) {
  $("#" + workId).prop("disabled", true);
  var num = workId;
  var userId = getCookie("nickname");
  var roomId = $('#roomId').val();
  var msg = {
    flag: "get",
    num: num,
    userId: userId,
    roomId: roomId
  }
  $.ajax({
    type: "POST",
    url: "/groupwork/todoList",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      if (result) {
        console.log("addMyList");
        console.log(result);
        createMYtodoList(result);
        socket.emit('with_ToDoList', result);
      } else {
        alert("MY TO DO LIST 생성실패!");
      }
    }
  });
}

//MyList를 완료하면 ALL TO DO List애서 이름을 삭제한다
function compelete(myToDoId) {
  console.log("compelete 함수");
  var userId = myToDoId.split(" ")[0];
  var num = myToDoId.split(" ")[1];
  var curr = document.getElementById(myToDoId);
  var parent = curr.parentNode;
  parent.remove();
  var msg = {
    userId: userId,
    num: num,
    flag: "myList_delete"
  }
  console.log(msg);
  $.ajax({
    type: "POST",
    url: "/groupwork/todoList",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      if (result) {
        console.log("addMyList");
        console.log(result);
        socket.emit('remove_AllToDoListUser', result);
      } else {
        alert("MY TO DO LIST 삭제실패!");
      }
    }
  });
}

function openListModal() {
  $("#ADDListModal").css("display", "block");
}

function closeListModal() {
  $('.AddList').val("");
  $("#ADDListModal").css("display", "none");
}

function createALLtodoList(msg) {
  var ALLtodoList = document.getElementById('ALLtodoList');
  var ALLlist = document.createElement('div');
  ALLlist.setAttribute("class", "ALLlist");
  ALLlist.innerHTML = "<input class='form-check-input' type='checkbox' id='" + msg.num + "' onclick='addMyList(this.id)' value='uncheck'>"
  ALLlist.innerHTML += "<p>" + msg.work + "</p><hr>"
  //ALLlist.innerHTML += "<span class ='with'>" + msg.userId + "</span>"
  ALLtodoList.appendChild(ALLlist);
}

function createMYtodoList(msg) {
  console.log("createMYtodoList");
  console.log(msg);
  var MYtodoList = document.getElementById('MYtodoList');
  var MYlist = document.createElement('div');
  MYlist.setAttribute("class", "MYlist");
  MYlist.innerHTML = "<input class='form-check-input' type='checkbox' id = '" + msg.userId + " " + msg.num + "' onclick=compelete(this.id) value='uncheck'>"
  MYlist.innerHTML += "<p>" + msg.work + "</p>"
  MYtodoList.appendChild(MYlist);
}

//ALL TO DO LIST에 참여자 추가 함수
function addWith(msg) {
  var curr = document.getElementById(msg.num);
  var parent = curr.parentNode;

  var together = document.createElement('span');
  together.setAttribute("class", "with");
  together.innerHTML = msg.userId + "  ";
  parent.appendChild(together);
}

function messageModal(className, message, name, nickname) {
  return;
}
