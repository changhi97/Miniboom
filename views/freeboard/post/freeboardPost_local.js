function main(){
  // setDelBtn();
  // setDelCommentBtn();
}
/*
function setDelBtn(){
  var user_id = $(".user_id").text().replace("작성자: ", "");
  var my_id = getCookie("nickname");

  // console.log(user_id, my_id);

  if(user_id != my_id){
      $(".del_btn").css({"display": "none"});
  }
}
*/

// 완성
// 함수명: resize
// 목적: 엔터 칠때마다 댓글 24px씩 증가
function resize(obj) {
  obj.style.height = "1px";
  obj.style.height = (12+obj.scrollHeight)+"px";
}

function setDelCommentBtn(){

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

function deleteComment(id) {
  var msg = new Object();
  msg.flag = "deleteComment";
  msg.pageId = getCookie("pageId");
  msg.user_id = getCookie("nickname");
  msg.comment_pw = $("#comment_pw").val();
  msg.comment_id = id;

  /*
  comment_html = $("#"+id).html()
  comment_id = $(".comment_id").val()
  test = $(comment_html).attr("comment_id");
  console.log(test, this)
  */

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
  msg.state = getCookie("state");
  msg.post_id = getCookie("pageId");
  msg.user_id = getCookie("nickname");
  msg.comment_pw = $("#comment_pw").val();
  msg.comment_content = $("#comment_content").val();

  if(msg.comment_pw == "" || msg.comment_content == ""){
    return alert("비밀번호를 입력하거나 댓글내용을 입력해주세요.");
  }

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
