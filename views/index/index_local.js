async function main(){
  await setUser();
  await startSocket();
  await enterkey();
}

function setUser(){
  var state = $("#state").val();

  if(state == "nonMember"){ // 비회원
    var nickname = getCookie("nickname");
    $("#nickname").val(nickname);
    if(nickname == null){
      const random_Id = Math.random().toString(36).substr(2, 11);
      var nickname = "비회원" + "#" + random_Id;
      setCookie("nickname", nickname, 3600);
      $("#nickname").val(nickname);
    }
    setCookie("state", state, 3600);
  }
  else{ // 회원
    var nickname = $("#nickname").val();
    setCookie("nickname", nickname, 3600);
    setCookie("state", state, 3600);
  }
}


function logout(){
  deleteCookie("nickname");
  deleteCookie("state");
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

function openMakeRoomModal(){
  $("#MakeRoomModal").css("display", "block");
  $(".Make-roomId").attr("readonly", false);
}
function closeMakeRoomModal() {
  $("#MakeRoomModal").css("display", "none");
}
function openEnterRoomModal(){
  $("#EnterRoomModal").css("display", "block");
  $(".Enter-roomId").attr("readonly", false);
}
function closeEnterRoomModal() {
  $("#EnterRoomModal").css("display", "none");
}

function MakeRoom(){
  var roomId=$('.Make-roomId').val();
  var roomPSW=$('.Make-roomPSW').val();
  var nickname = getCookie("nickname");
  var state = $("#state").val();
  if (roomId.trim().length === 0 ) return;
  if (roomPSW.trim().length === 0 ) return;
  var msg = {
    roomId : roomId,
    roomPSW : roomPSW,
    nickname : nickname,
    state : state
  }
  $.ajax({
    type: "POST",
    url: "/groupwork/makeRoom",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log(result);
      if(result){
        alert("생성성공!");
        window.open("https://miniboom.site/groupwork", "_self");
      }else{
        alert("방 아이디가 중복됩니다!");
        window.open("https://miniboom.site/", "_self");
      }
    }
  });
}
function EnterRoom(){
  var roomId=$('.Enter-roomId').val();
  var roomPSW=$('.Enter-roomPSW').val();
  var nickname = getCookie("nickname");
  var state = $("#state").val();
  if (roomId.trim().length === 0 ) return;
  if (roomPSW.trim().length === 0 ) return;
  var msg = {
    roomId : roomId,
    roomPSW : roomPSW,
    nickname : nickname,
    state : state
  }
  $.ajax({
    type: "POST",
    url: "/groupwork/enterRoom",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log(result);
      if(result===true){
        window.open("https://miniboom.site/groupwork", "_self");
      }else if(result === "room"){
        alert("방이 존재하지 않습니다!");
        window.open("https://miniboom.site/", "_self");
      }else if(result === "psw"){
        alert("비밀번호 오류!");
        window.open("https://miniboom.site/", "_self");
      }
    }
  });
}
