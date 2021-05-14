function getPost(pageId){
  window.location.href= 'https://miniboom.site/freeboard/post/' + pageId;
  setCookie("pageId", pageId, 3600*24) // 1 day
}

function changBoard(valaue){
  window.open("http:miniboom.site/freeboard/?num=" + value, "_self");
}
