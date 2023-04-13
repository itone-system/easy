
$(document).ready(function () {
  const queryString = window.location.search;

  if (queryString) {
    const action = $('#form').attr('action')
    $('#form').attr('action', `${action}${queryString}`)
  }
});
