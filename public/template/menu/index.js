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

const paginaAcompanhar = () => {
    window.location.assign(`/solicitacoes/listar`)
}

const paginaNovaSolicitacao = () => {
    window.location.assign(`/criar`)
}

const incluirNota = () => {
    window.location.assign(`/notafiscal/incluirNota`)
}

const buscarNotas = () => {
    window.location.assign(`/notafiscal/buscarNotas`)
}

const sair = () => {
    window.location.assign(`/sair`)
}

const dropdownToggle = document.querySelector('.dropdown-toggle');
const subMenu = document.querySelector('.sub-menu');
const acompanhar2 = document.querySelector('acompanhar2')
const relative = document.getElementById('relative')

dropdownToggle.addEventListener('click', () => {
  subMenu.classList.toggle('show');
  relative.classList.toggle('teste');
  // acompanhar2.style.marginTop = "20px";
});

const dropdownToggle2 = document.querySelector('.dropdown-toggle2');
const subMenu2 = document.querySelector('.sub-menu2');
const acompanhar3 = document.querySelector('acompanhar3')
const relatives = document.getElementById('relatives2')

dropdownToggle2.addEventListener('click', () => {
  subMenu2.classList.toggle('show');
  relatives.classList.toggle('teste2');
  // acompanhar2.style.marginTop = "20px";
});
