function openModal(id){
  $("#messageModal").css("display", "block");
  $("#sendMessage").css("display", "none");
  $("#replyMessage").css("display", "block");
  $("#poster-content").attr("readonly", true);
  var sender=$(id).find('.sender').text();
  var content=$(id).find('.content').text();
  var sender_state=$(id).find('.sender_state').val();
  $('#message-target').text(sender);
  $('#message-target').val(sender);
  $('#poster-content').text(content);
  $('#poster-content').val(content);

  if(sender_state!=='Member'){
    $("#replyMessage").css("display", "none");
  }else{
    var replyMessage = document.getElementById('replyMessage');
    replyMessage.addEventListener('click', function() {
      openReplyModal();
    });
  }
}

function closeModal(){
  $("#messageModal").css("display", "none");
}

function openReplyModal(){
  $("#messageModal").css("display", "block");
  $("#sendMessage").css("display", "block");
  $("#replyMessage").css("display", "none");
  $("#poster-content").text('');
  $("#poster-content").val('');
  $("#poster-content").attr("readonly", false);
}

function sendMemo() {
  var reciver = $("#message-target").val().trim();
  var sender = $('#nickname').val();
  var content = $("#poster-content").val();
  console.log("notice send");
  console.log(reciver);
  console.log(sender);
  console.log(content);
  console.log("notice send");

  if (reciver == undefined || content.trim().length === 0) return;

  var msg = {
    flag: "memo",
    reciver: reciver,
    sender: sender,
    content: content
  }
  console.log("sendMemo: ",msg);
  $.ajax({
    type: "POST",
    url: "/push_Notification",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log("result",result);
      closeModal();
    }
  });
}
