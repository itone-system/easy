const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text"),
    mudarDark = body.querySelector("#mudarDark"),
    mudarTituloTabela = body.querySelector('.topo-tabela'),
    mudarIcon = body.querySelector('.alterar-icon')
    mudarIconStatus = body.querySelector('.mudar-icon-status'),
    alterarAfter = body.querySelector('.alterar-after'),
    alterarNumero = body.querySelector('.alterar-numero'),
    alterarCheck =body.querySelector( '.alterar-check'),
    alterarBolinha = body.querySelector('.alterar-bolinha'),
    alterarBodyModal = body.querySelector('.modal-body'),
    modalHeader = body.querySelector('.modal-header'),
    modalfooter = body.querySelector('.modal-footer')


toggle.addEventListener("click", () => {
    sidebar.classList.toggle("fechado");
})

$(document).ready(function () {
    if (localStorage.getItem("darkMode") === "true") {
        body.classList.add("dark");
    }
});


// searchBtn.addEventListener("click", () => {
//     sidebar.classList.remove("fechado");
// })

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        localStorage.setItem("darkMode", "true");


    } else {
        localStorage.setItem("darkMode", "false");


    }



    if (body.classList.contains("dark")) {

        mudarDark.innerHTML = ` <span class="mode-text text " style="color: white;">Light mode</span>`
    } else {
        mudarDark.innerHTML = ` <span class="mode-text text " style="color: black;">Dark mode</span>`

    }
});

var darkModeBtn = document.getElementById("dark-mode-btn");
if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark");
}

const paginaHome = () => {
    window.location.assign(`/home`)
}



const formFerias = () => {
  window.location.assign(`/formularios/ferias`)
}

const formDesligamento = () => {
  window.location.assign(`/formularios/desligamento`)
}

const formAlteracao = () => {
  window.location.assign(`/formularios/alteracaoCadastral`)
}

const consultarFormularios = () => {
  window.location.assign(`/formularios/consultar`)
}
const sair = () => {
    window.location.assign(`/sair`)
}

const dropdownToggle = document.querySelector('.dropdown-toggleForm');
const subMenu = document.querySelector('.sub-menuForm');
const relative = document.getElementById('relativeForm1')

dropdownToggle.addEventListener('click', () => {
  permissaoFerias = document.getElementById('feriasPermissao').innerText
  desligPermissao = document.getElementById('desligPermissao').innerText
  alterPermissao = document.getElementById('alterPermissao').innerText

  if(permissaoFerias && desligPermissao && desligPermissao){
    subMenu.classList.toggle('show');
    relative.classList.toggle('teste');
  }else {
    subMenu.classList.toggle('show');
    relative.classList.toggle('teste2');
  }
});


const dropdownToggle3 = document.querySelector('.dropdown-toggleForm1');
const subMenu3 = document.querySelector('.sub-menuForm1');
// const relatives3 = document.getElementById('relatives3')

dropdownToggle3.addEventListener('click', () => {
  subMenu3.classList.toggle('show');
  // relatives3.classList.toggle('teste3');
});
