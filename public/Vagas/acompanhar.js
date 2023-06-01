window.onload = function () {
    const toggle = body.querySelector(".toggle")
    const clickEvent = new MouseEvent('click');
    toggle.dispatchEvent(clickEvent);
  
    $(document).ready(function () {
      $('.table-row').on('click', function () {
        const codigo = $(this).data('codigo');
        window.location.href = `/vagas/${codigo}/detail`;
      });
    });


    $('[data-toggle="tooltip"]').tooltip()


    document.getElementById('previous').addEventListener('click', (event) => {
      event.preventDefault();
      
      const currentPageInput = document.getElementById('currentPage');
      currentPageInput.value = parseInt(currentPageInput.value) - 1;
      
      document.getElementById('myForm').submit();
    });
    
    document.getElementById('next').addEventListener('click', (event) => {
      event.preventDefault();
      
      const currentPageInput = document.getElementById('currentPage');
      currentPageInput.value = parseInt(currentPageInput.value) + 1;
      
      document.getElementById('myForm').submit();
    });
  }

 