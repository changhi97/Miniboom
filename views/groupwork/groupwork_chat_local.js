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
  disconnect();
  document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
}


/* 접속 되었을 때 실행 */
function connect() {
  socket.on('connect', function() {
    var info = new Object();
    info.nickname = getCookie("nickname");
    info.state = getCookie("state");
    socket.emit('newUser', info);
  })
}

function newUser_response() {
  socket.on('newUser_response', function(data) {
    var info = data.info
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
    socket.emit('newUser_notice', info);
  })
}

/*
 * 유저 입장시 입장 알림메시지 출력
 */
function newUser_notice() {
  socket.on('newUser_notice', function(data) {
    var info = data.info;
    // HTML
    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${info.nickname} 님이 접속하셨습니다.`)
    //class type connect disconnect other me
    var className = 'newUser-notice'
    message.classList.add(className);
    message.appendChild(node);
    chat.appendChild(message);
    // HTML

    $("#chat").scrollTop($("#chat")[0].scrollHeight);
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
    console.log("새로운 방장은");
    console.log(data.newMaster);
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

function messageModal(className, message, name, nickname) {
  /*if (className === 'you') {
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
    a.setAttribute("data-target", ".modal");
    var text = document.createTextNode("쪽지 보내기");

    a.appendChild(text);
    li.appendChild(a);
    ul.appendChild(li);
    message.appendChild(ul);
    */
  /*var modal = document.createElement('div');
  modal.setAttribute("class", "modal");
  //modal.setAttribute("id", nickname);
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
  message.appendChild(modal);*/
  //}
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

//If you want to copyText from Element
function copyLink() {
  let element = document.getElementById('roomLink');
  let elementText = element.textContent;
  navigator.clipboard.writeText(elementText);
  alert('링크가 복사되었습니다');
}
