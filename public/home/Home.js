$(document).ready(function () {
  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);
});
