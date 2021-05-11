async function main() {
  setUser();
  startSocket();
  enterkey();
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
