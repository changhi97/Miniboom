function setCookie(name, value, exp) {
  var date = new Date();
  date.setTime(date.getTime() + exp*1000); // 1000ms = 1sec
  document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
}

function getCookie(name) {
  var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value? value[2] : null;
}

function deleteCookie(name) {
  setCookie(name, null, -1);
}


function getQueryString(key){
  var results = new RegExp('[\?&]' + key + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return results[1] || 0;
  }
}
