async function main() {
  await setUser();
  await startSocket();
  await enterkey();
}

function setUser() {
  var state = $("#state").val();

  if (state == "nonMember") { // 비회원
    var nickname = getCookie("nickname");
    $("#nickname").val(nickname);
    if (nickname == null) {
      const random_Id = Math.random().toString(36).substr(2, 11);
      var nickname = "비회원" + "#" + random_Id;
      setCookie("nickname", nickname, 3600);
      $("#nickname").val(nickname);
    }
    setCookie("state", state, 3600);
  } else { // 회원
    var nickname = $("#nickname").val();
    setCookie("nickname", nickname, 3600);
    setCookie("state", state, 3600);
  }
}

function logout() {
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

function roomOut() {
  var roomId = $('#roomLink').text();
  var nickname = $('#nickname').val();
  var msg = {
    roomId: roomId,
    nickname: nickname
  }

  console.log(msg);
  $.ajax({
    type: "POST",
    url: "/groupwork/roomOut",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      if (result) {
        window.open("https://miniboom.site/", "_self");
      }
    }
  });
}

//If you want to copyText from Element
function copyLink() {
  let element = document.getElementById('roomLink');
  let elementText = element.textContent;
  navigator.clipboard.writeText(elementText);
  alert('링크가 복사되었습니다');
}
