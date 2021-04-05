function openModal(id){
  $("#logoutModal").css("display", "block");
  var sender=$(id).find('.sender').text();
  var title=$(id).find('.title').text();
  var content=$(id).find('.content').text();
  $('.modal-title').text(title);
  $('.modal-body').text(content);
  $('.modal-footer').text(sender);

}
function closeModal(){
  $("#logoutModal").css("display", "none");
}
