//var nickname = document.getElementById('nickname').value; //게시글 작성자의 아이디를 받아온다var nickname = document.getElementById('nickname').value; //게시글 작성자의 아이디를 받아온다

const triggerPush = document.querySelector('.trigger-push');
const title = document.getElementById('title');
const content = document.getElementById('content');

triggerPush.addEventListener('click', () => {
  var nickname = document.getElementById('nickname').value; // 테스트를위한
  var msg={
    flag : "push_test",
    nickname: nickname,
    title: title.value,
    content: content.value,
  }
  $.ajax({
    type: "POST",
    url: "/push_Notification",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg)
  });
});
