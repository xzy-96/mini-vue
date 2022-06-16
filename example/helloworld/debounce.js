var count = 1;
var container = document.getElementById("container");

function getUserAction(e) {
  console.log(this, 333333, e);
  container.innerHTML = count++;
}

container.onmousemove = debounce(getUserAction, 1000, true);
function debounce(fn, wait, immediate) {
  console.log(this, 1111);
  var timeout;
  return function () {
    // container element
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 如果已经执行过，不再执行
      console.log(timeout);
      var callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) fn.apply(this, arguments);
    } else {
      timeout = setTimeout(fn.bind(this, arguments), wait);
    }
  };
}
