var socket = io()
let siofu = new SocketIOFileUpload(socket);

/*
 *
 */
function startSocket() {
  connect();
  update();
  loadData();
  newUser_notice();
  disconnect();
  document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
}

/*
 * 유저 입장시 입장시 이전 데이터 출력
 */
function loadData() {
  socket.on('loadData', function(data) {
    var nickname = $('#nickname').val(); //현재 접속한 유저의 아이디 data의 nickname과 비교하기위함

    for (var index in data.loadData) {
      var load_data = data.loadData[index];
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

        var className = 'you';
        if (nickname === load_data.user_id) {
          className = 'me';
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

        var className = 'you';
        if (nickname === load_data.user_id) {
          className = 'me';
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
    socket.emit('newUser_notice');
  })
}

/*
 * 유저 입장시 입장 알림메시지 출력
 */
function newUser_notice() {
  socket.on('newUser_notice', function(data) {
    //console.log("NEW", data);
    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.name} 님이 접속하셨습니다.`)
    //class type connect disconnect other me
    var className = 'newUser-notice'

    message.classList.add(className);
    message.appendChild(node);
    chat.appendChild(message);
    $("#chat").scrollTop($("#chat")[0].scrollHeight);
  })
}

/* 접속 되었을 때 실행 */
function connect() {
  socket.on('connect', function() {

    /* 서버에 새로운 유저가 왔다고 알림 */
    socket.emit('newUser');
  })
}

function disconnect() {
  socket.on('disconnection', function(data) {

    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.message} 님이 나가셨습니다.`)
    var className = 'newUser-notice'

    // 화면에 출력
    message.classList.add(className)
    message.appendChild(node)
    chat.appendChild(message)

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
      var nickname = $('#nickname').val();

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

      var className = 'you';
      if (nickname === data.name) {
        className = 'me';
      }

      message.classList.add(className);
      name.appendChild(name_Node);
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
    // 전송받은 데이터가 file일 경우
    else {
      console.log("데이터 file: ", data);

      var file_link = data.link;
      file_link = file_link.replaceAll('"', '');

      var today = new Date();
      var hours = today.getHours(); // 시
      var minutes = today.getMinutes(); // 분
      var localtime = `${hours} : ${minutes}`;
      var nickname = $('#nickname').val();

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


      var className = 'you';
      if (nickname === data.name) {
        className = 'me';
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

function enterkey() {
  window.addEventListener("keydown", (e) => {
    const key = e.key
    if (key == "Enter") {
      send();
    }
  })

  window.addEventListener("keyup", (e) => {
    const key = e.key
  })
}

function messageModal(className, message, name, nickname) {
  if (className === 'you') {
    name.setAttribute("href", "#");
    name.setAttribute("id", "dropdown01");
    name.setAttribute("data-bs-toggle", "dropdown");
    name.setAttribute("aria-expanded", "false");
    var ul = document.createElement('ul');
    var li = document.createElement('li');
    var a = document.createElement('a');
    ul.setAttribute("class", "dropdown-menu");
    ul.setAttribute("aria-labelledby", "dropdown01");
    a.setAttribute("class", "dropdown-item");
    a.setAttribute("href", "#");
    a.setAttribute("data-toggle", "modal");
    a.setAttribute("data-target", "#" + nickname);
    var text = document.createTextNode("쪽지 보내기");

    a.appendChild(text);
    li.appendChild(a);
    ul.appendChild(li);
    message.appendChild(ul);

    var modal = document.createElement('div');
    modal.setAttribute("class", "modal");
    modal.setAttribute("id", nickname);
    modal.setAttribute("data-backdrop", "false");
    var string =
      "<div class='modal-dialog' role='document'>" +
      "<div class='modal-content'>" +
      "<div class='modal-header'>" +
      "<span class='modal-title' id='message-target'>" + nickname + "</span>" +
      "</div>" +
      "<div class='modal-body'><textarea id='poster-content' name='poster-content' rows='10' cols='40'></textarea></div>" +
      "<div class='modal-footer'>" +
      "<button class='btn btn-secondary' data-dismiss='modal'>Cancel</button>" +
      "<a class='btn btn-primary' onclick='sendMemo(" + nickname + ")'>SEND</a>" +
      "</div>" +
      "</div>" +
      "</div>";
    modal.innerHTML = string;
    message.appendChild(modal);
  }
}

function sendMemo(memo) {
  var target = $(memo).attr('id');
  var content = $(memo).find('#poster-content').val()
  $(memo).find('#poster-content').val('');

  if (target == undefined || content.trim().length === 0) return;

  var msg={
    flag : "memo",
    sender : $('#nickname').val(),
    reciver :  target,
    content : content
  }
  console.log(msg);
  $.ajax({
    type: "POST",
    url: "/push_Notification",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log("result");
      console.log(result);
      if(result){
        //$(memo).modal('hide'); 안먹힘
        $(memo).hide();
      }else{
        alert("비회원에게 보낼 수 없습니다");
        $(memo).hide();
      }
    }
  });
}
