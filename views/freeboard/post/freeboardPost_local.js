function main(){
  setDelBtn();
  setDelCommentBtn();
  writeComment();
}

function setDelBtn(){
  var user_id = $(".user_id").text().replace("작성자: ", "");
  var my_id = getCookie("nickname");

  // console.log(user_id, my_id);

  if(user_id != my_id){
      $(".del_btn").css({"display": "none"});
  }
}

// 엔터 칠때마다 댓글 24px씩 증가
function resize(obj) {
  obj.style.height = "1px";
  obj.style.height = (12+obj.scrollHeight)+"px";
}

// 함수 완성
// 게시글 삭제 함수
function deletePost(){
  var msg = new Object();
  msg.flag = "deletePost";
  msg.pageId = getCookie("pageId");

  $.ajax({
    type: "POST",
    url: "https://miniboom.site/freeboard/post/" + msg.pageId,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      window.open("https://miniboom.site/freeboard/", "_self");
    }
  });
}

function deleteComment() {
  var msg = new Object();
  msg.flag = "deleteComment";
  $.ajax({
    type: "POST",
    url: "https://miniboom.site/freeboard/post/" + msg.pageId,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      window.open("https://miniboom.site/freeboard/post/" + msg.pageId, "_self");
    }
  })
}

function writeComment() {
  var msg = new Object();
  msg.flag = "writeComment";
  
  $.ajax({
    type: "POST",
    url: "https://miniboom.site/freeboard/post/" + msg.pageId,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      window.open("https://miniboom.site/freeboard/post/" + msg.pageId, "_self");
    }
  })
}
