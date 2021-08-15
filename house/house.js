
var elms = ['controls'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});


function setColor(color) {
  let images = document.getElementsByClassName("house-img");
  for (let i = 0; i < images.length; i++) {
    images.item(i).style.background = color;
  }
}

var picker = document.getElementById("house-color");

picker.addEventListener('input', function(event) {
  setColor(picker.value);
});

setColor("#FFF");
