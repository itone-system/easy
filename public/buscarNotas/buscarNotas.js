// import { restringirUsuario} from '../scripts/verificaUsuario';
let pagina = 1;
let arraySolicitacao = [];
let totalPaginas = null;
let codigoNF = 0;
let codigoRetornoNF = '';
let tokenAtivo = false;

$(document).ready(function () {
  const toggle = body.querySelector('.toggle');
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);
  // $('#prev').css("display", "none")
  // $('#prev').css("visibility", "hidden")
  conveniaCentroCusto();

  const downloadArquivoNF = document.getElementById('baixararq');
  downloadArquivoNF.addEventListener('click', function () {
    downloadNF();
  });

  let elementModal = document.getElementById('openModal');

  let tabelaNF = document.querySelectorAll('#tabelaNF');

  tabelaNF.forEach((row) => {
    row.addEventListener('click', () => {
      // window.location.assign(`/notafiscal/buscarNotas?codigoNF=${row.cells[0].innerText}`)
      elementModal.click();

      gerarDadosModal(row.cells[0].innerText, tokenAtivo);
    });
  });

  let codigoNFToken = document.getElementById('CodigoNF');
  if (codigoNFToken.innerText) {
    elementModal.click();
    gerarDadosModal(codigoNFToken.innerText);
  }
});

// function proxPage() {

//     pagina++

//     if (pagina > 1) {
//         $('#prev').attr("disabled", false)
//     }
//     if (pagina <= totalPaginas) {

//         $("#tbody").empty()

//         listar(pagina)

//         if (pagina == totalPaginas) {

//             $('#prox').attr("disabled", true)
//         }
//     }
//     else {
//         $('#prox').attr("disabled", "disabled")
//     }

//     window.location.assign(`/buscarNotas?paginate=${pagina}`)

// }

// const prevPage = () => {

//     if (pagina === 1) {
//         $('#prev').attr("disabled", true)
//     }

//     if (pagina > 1) {
//         pagina--

//         if (pagina == 1) {

//             $('#prev').attr("disabled", true)
//         }
//     }

//     window.location.assign(`/buscarNotas?paginate=${pagina}`)

//     $("#tbody").empty()

//     $('#prox').attr("disabled", false)
// }

// const listar = (paginaNumerada) => {

//     if(document.getElementById('CentroCusto').value == "Centro de Custo"){
//         var centroCusto = ""
//     }
//     else{
//         var centroCusto = document.getElementById('CentroCusto').value
//     }

//     var centroCustoSplit = centroCusto.split(". ")

//     let objeto = {
//         pagina: pagina,
//         usuario: itens2[1],
//         usuarioSolicitante: itens2[0],
//         centroCustoUsuario: itens2[2],
//         Descricao: document.getElementById('Descricao').value,
//         Solicitante: document.getElementById('Solicitante').value,
//         Fornecedor: document.getElementById('Fornecedor').value,
//         centroCustoFiltro: centroCustoSplit[0]
//     }

//     const paginaPadrao = 1

//     if (!paginaNumerada) {

//         objeto.pagina = paginaPadrao
//     }

//     $("#tbody").empty()

//     fetch(endpoints.ListarNotas, {
//         method: 'POST',
//         body: JSON.stringify(objeto),
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//         }
//     }).then(dados => {
//         console.log(dados)
//         return dados.json()
//     }).then(dados => {
//         totalPaginas = dados.paginas

//         arraySolicitacao = dados.itens;
//         console.log(arraySolicitacao)
//         listaTabela();

//         if (arraySolicitacao.length != 0 && pagina == 1) {
//             $('#prox').attr("disabled", false)
//         }

//     })

// }

// const listaTabela = () => {

//     // for (let i = 0; i < arraySolicitacao.length; i++) {

//     //     let tbody = document.getElementById('tbody');

//     //     let tr = tbody.insertRow();
//     //     tr.style.cursor = 'pointer'
//     //     tr.onclick

//     //     let modalBody = document.getElementById('modalBody')

//     //     let td_codigo = tr.insertCell();
//     //     let td_solicitante = tr.insertCell();
//     //     let td_CentroCusto = tr.insertCell();
//     //     let td_fornecedor = tr.insertCell();
//     //     let td_descricao = tr.insertCell();
//     //     let td_statunf = tr.insertCell();
//     //     let td_tipoContrato = tr.insertCell();
//     //     let td_pagamento = tr.insertCell();
//     //     let td_dadosBanc= tr.insertCell();
//     //     let td_dtpagamento= tr.insertCell();
//     //     let td_deal= tr.insertCell();
//     //     let td_colaborador= tr.insertCell();

//     //     td_codigo.innerText = arraySolicitacao[i].Codigo;
//     //     td_solicitante.innerText = arraySolicitacao[i].Solicitante;
//     //     td_CentroCusto.innerText = arraySolicitacao[i].CentroCusto;
//     //     td_fornecedor.innerText = arraySolicitacao[i].Fornecedor;
//     //     td_descricao.innerText = arraySolicitacao[i].Descricao;

//     //     switch(arraySolicitacao[i].StatusNF){
//     //         case "A":
//     //             td_statunf.innerHTML = '<a class="btn btn-primary text-white  rounded" style=" height: 27px; font-size: 11px"  >Aguardando envio</a>'
//     //         break
//     //         case "E":
//     //             td_statunf.innerHTML = '<a class="btn btn-secondary text-white  rounded" style="  height: 27px;  font-size: 11px"  >Enviado para pagamento</a>'
//     //         break
//     //     }
//     //     td_tipoContrato.innerText = arraySolicitacao[i].TipoContrato;
//     //     td_pagamento.innerText = arraySolicitacao[i].TipoPagamento;
//     //     td_dadosBanc.innerText = arraySolicitacao[i].DadosBanc;
//     //     td_dtpagamento.innerText = arraySolicitacao[i].DataPagamento;
//     //     td_deal.innerText = arraySolicitacao[i].Deal;
//     //     td_colaborador.innerText = arraySolicitacao[i].Colaborador;

//     //     // td_solicitante.innerText = this.arraySolicitacao[i].DataAtualizacao;

//     //     // td_acoes.innerHTML = '<div class="dropdown">  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="float: left; font-size: 13px"> Ações   </button>    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">      <a class="dropdown-item" href="nova_solicitacao.html">Aprovações</a>      <a class="dropdown-item" href="#">Editar</a>      <a class="dropdown-item" href="#">Excluir</a>    </div>  </div>'

//     //     // td_status.innerHTML = '<a class="p-1 mb-2 bg-primary text-white  rounded" style=" float: left; font-size: 13px"  >Pendente Aprovação</a>'

//         //$(tr).data('a', arraySolicitacao[i])

//         let teste = document.getElementById('tbody');

//         console.log(teste)

//         $(tr).click(function () {

//             let element = document.getElementById('openModal');
//             if (element.click) {
//                 element.click();
//                 let row = jQuery(this).closest('tr')
//                 let columns = row.find('td')

//                 columns.addClass('row-highlight');

//                 const { Codigo, Descricao, Fornecedor, Solicitante, TipoContrato, TipoPagamento, DataPagamento, Deal, Observacao, Colaborador, StatusNF } = $(this).data('a')

//                 restringirUsuario(modalBody, Codigo, Descricao, Fornecedor, Solicitante, TipoContrato, TipoPagamento, DataPagamento, Deal, Observacao, Colaborador, StatusNF)

//             }
//         })

//     }

// const deletar = (id) => {

//     const objeto = {
//         id: id
//     }

//     fetch('http://localhost:3458/Delete', {
//         method: 'POST',
//         body: JSON.stringify(objeto),
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//         }
//     }).then(dados => {
//         console.log(dados)
//         return dados.json()
//     }).then(dados => {

//         alert('Tem certeza que desejar excluir a solicitação n° ' + id + '?')

//         let tbody = document.querySelector('tbody');

//         for (let i = 0; i < arraySolicitacao.length; i++) {
//             if (arraySolicitacao[i].Codigo == id) {
//                 //this.arraySolicitacao.splice(i, 1);
//                 tbody.deleteRow(i);
//             }
//         }
//     })

// }

// const restringirUsuario = (modalBody, Codigo, Descricao, Fornecedor, Solicitante, TipoContrato, TipoPagamento, DataPagamento, Deal, Observacao, Colaborador , StatusNF) => {

//     if (itens2[1] == 1 && StatusNF == "E") {
//         console.log(StatusNF)
//         modalBody.innerHTML = `

//         <div>

//                 <div class="row g-3">
//                 <div class="col Solicitacao">
//                   <label>N° Solicitação:</label>
//                   <input id="NumeroSolicitacaoModal" for="NumeroSolicitacao" style="margin-bottom: 10%;" value="${Codigo}" type="text" class="form-control" readonly>

//                 </div>

//                 <div class="col Solicitante">
//                     <label>Solicitante:</label>
//                     <input id="Solicitante" for="Solicitante" style="margin-bottom: 10%;" value="${Solicitante}" type="text" class="form-control" readonly>
//                     </div>
//               </div>
//               <div class="row g-3">
//               <div class="col Fornecedor">
//                 <label>N° Fornecedor:</label>
//                 <input id="Fornecedor" for="Fornecedor" style="margin-bottom: 10%;" value="${Fornecedor}" type="text" class="form-control" readonly>

//               </div>

//               <div class="col Descricao">
//                   <label>Descricao:</label>
//                   <input id="Descricao" for="Descricao" style="margin-bottom: 10%;" value="${Descricao}" type="text" class="form-control" readonly>
//                   </div>
//             </div>

//             <div class="row g-3">
//             <div class="col TipoContrato">
//               <label>Tipo do Contrato:</label>
//               <input id="TipoContrato" for="TipoContrato" style="margin-bottom: 10%;" value="${TipoContrato}" type="text" class="form-control" readonly>

//             </div>

//             <div class="col Deal">
//                 <label>Deal:</label>
//                 <input id="Deal" for="Deal" style="margin-bottom: 10%;" value="${Deal}" type="text" class="form-control" readonly>
//                 </div>
//        </div>

//           <div class="row g-3">
//           <div class="col TipoPagamento">
//             <label>Tipo do Pagamento:</label>
//             <input id="TipoPagamento" for="TipoPagamento" style="margin-bottom: 10%;" value="${TipoPagamento}" type="text" class="form-control" readonly>

//           </div>

//           <div class="col DataPagamento">
//               <label>Data do Pagamento:</label>
//               <input id="DataPagamento" for="DataPagamento" style="margin-bottom: 10%;" value="${DataPagamento}" type="text" class="form-control" readonly>
//               </div>
//         </div>

//           <label>Observação:</label>
//           <input id="Observacao" for="Observacao" style="margin-bottom: 5%;" value="${Observacao}" type="text" class="form-control" readonly>

//           <label>Colaborador:</label>
//             <input id="Colaborador" for="Colaborador" style="margin-bottom: 5%;" value="${Colaborador}" type="text" class="form-control" readonly>
//             </div>

//             <div  style="margin-left: 20%; margin-right: 25%;" >
//             <label>Status:</label>
//             <select id="StatusNF" class="form-control">
//               <option selected>Enviado para pagamento</option>

//             </select>
//           </div>

//       </div>

//         </div>

//         `

//         $('#dataDaCompra').attr("disabled", false)
//         $('#StatusNF').attr("disabled", true)

//        /* $('#valorDaCompra').attr("disabled", false)
//         $('#previsaoDeEntrega').attr("disabled", false)
//         $('#Sim').attr("disabled", false)
//         $('#Não').attr("disabled", false)
//        $('#salvarCompra').css("display", "none")  */

//     }

//     if (itens2[1] == 1 && StatusNF == "A" ) {
//         modalBody.innerHTML = `

//         <div>

//                 <div class="row g-3">
//                         <div class="col Solicitacao">
//                             <label>N° Solicitação:</label>
//                             <input id="NumeroSolicitacaoModal" for="NumeroSolicitacao" style="margin-bottom: 10%;" value="${Codigo}" type="text" class="form-control" readonly>

//                         </div>

//                         <div class="col Solicitante">
//                             <label>Solicitante:</label>
//                             <input id="Solicitante" for="Solicitante" style="margin-bottom: 10%;" value="${Solicitante}" type="text" class="form-control" readonly>
//                         </div>
//               </div>

//                 <div class="row g-3">
//                     <div class="col Fornecedor">
//                         <label>N° Fornecedor:</label>
//                         <input id="Fornecedor" for="Fornecedor" style="margin-bottom: 10%;" value="${Fornecedor}" type="text" class="form-control" readonly>
//                     </div>

//                     <div class="col Descricao">
//                         <label>Descricao:</label>
//                         <input id="Descricao" for="Descricao" style="margin-bottom: 10%;" value="${Descricao}" type="text" class="form-control" readonly>
//                     </div>
//                  </div>

//                 <div class="row g-3">
//                     <div class="col TipoContrato">
//                             <label>Tipo do Contrato:</label>
//                             <input id="TipoContrato" for="TipoContrato" style="margin-bottom: 10%;" value="${TipoContrato}" type="text" class="form-control" readonly>
//                     </div>

//                     <div class="col Deal">
//                         <label>Deal:</label>
//                         <input id="Deal" for="Deal" style="margin-bottom: 10%;" value="${Deal}" type="text" class="form-control" readonly>
//                     </div>
//                 </div>

//           <div class="row g-3">
//           <div class="col TipoPagamento">
//             <label>Tipo do Pagamento:</label>
//             <input id="TipoPagamento" for="TipoPagamento" style="margin-bottom: 10%;" value="${TipoPagamento}" type="text" class="form-control" readonly>

//           </div>

//           <div class="col DataPagamento">
//               <label>Data do Pagamento:</label>
//               <input id="DataPagamento" for="DataPagamento" style="margin-bottom: 10%;" value="${DataPagamento}" type="text" class="form-control" readonly>
//               </div>
//         </div>

//           <label>Observação:</label>
//           <input id="Observacao" for="Observacao" style="margin-bottom: 5%;" value="${Observacao}" type="text" class="form-control" readonly>

//           <label>Colaborador:</label>
//             <input id="Colaborador" for="Colaborador" style="margin-bottom: 5%;" value="${Colaborador}" type="text" class="form-control" readonly>
//             </div>

//             <div  style="margin-left: 20%; margin-right: 25%;" >
//             <label>Status:</label>
//             <select id="StatusNF" class="form-control">
//               <option selected>Aguardando envio para pagamento</option>
//               <option>Enviado para pagamento</option>
//             </select>
//           </div>

//       </div>

//         </div>

//         `

//         $('#dataDaCompra').attr("disabled", false)
//         $('#StatusNF').attr("disabled", false)

//        /* $('#valorDaCompra').attr("disabled", false)
//         $('#previsaoDeEntrega').attr("disabled", false)
//         $('#Sim').attr("disabled", false)
//         $('#Não').attr("disabled", false)
//        $('#salvarCompra').css("display", "none")  */

//     }

//     if (itens2[1] == 1 ) { //e pagina seja == a pagina atual

//         modalBody.innerHTML = `

//         <div >

//             <ul>
//                 <li>${Codigo}<l1>
//                 <li>${Descricao}<l1>
//                 <li>${DataAtualizacao}<l1> <br><br>

//             </ul>
//                 <label for="fname">Data da Compra:</label>
//                 <input type="date" id="dataDaCompra" class="form-control"><br><br>

//                 <label for="fname">Valor:</label>
//                 <input type="number" step="0.01" id="valorDaCompra" class="form-control"><br><br>

//                 <label for="fname">Previsão de entrega:</label>
//                 <input type="date" id="previsaoDeEntrega" name="fname" class="form-control" ><br><br>

//                 <label for="cars">Possui Parcelas?</label>
//                 <div>
//                   <input onclick="adicionarCampoParcelas()"  type="radio" id="Sim" name="fav_language" value="Sim">
//                   <label for="Sim">Sim</label><br>
//                   <input onclick="removerCampoParcelas()" type="radio" id="Não" name="fav_language" value="Não" checked>
//                   <label for="Não">Não</label><br>
//                 </div>

//                 <div id="divParcela">

//                 </div>
//                 <br>
//                 <br>

//         </div>

//         `
//     }

//     if (itens2[1] == 2) {
//         modalBody.innerHTML = `<ul>
//         <li>${Codigo}<li>
//         <li>${Descricao}<l1>
//         <li>${DataAtualizacao}<l1> <br><br>
//             </ul>`
//     }

//     if (itens2[1] == 3) {

//     }

// }

const atualizarStatusNF = () => {
  StatusNF = document.getElementById('StatusNF').value;
  Codigo = document.getElementById('NumeroSolicitacaoModal').value;
  Solicitante = document.getElementById('ModSolicitante').value;
  Descricao = document.getElementById('ModDescricao').value;
  Fornecedor = document.getElementById('ModFornecedor').value;

  let headersList = {
    'Content-Type': 'application/json'
  };

  let bodyContent = JSON.stringify({
    Codigo: Codigo,
    StatusNF: StatusNF.substr(0, 1),
    Solicitante: Solicitante,
    Descricao: Descricao,
    Fornecedor: Fornecedor
  });

  let response = fetch(endpoints.AtualizarNF, {
    method: 'POST',
    body: bodyContent,
    headers: headersList
  });

  alert('Status do recebimento n° ' + Codigo + ' alterado.');
  window.location.reload();
};

const conveniaCentroCusto = () => {
  fetch('https://public-api.convenia.com.br/api/v3/companies/cost-centers', {
    method: 'GET',
    redirect: 'follow',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: '82856aeb-fa11-4918-b2bc-f7a49322f69b'
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      var dados = result.data;
      let listaCC = [];

      dados.forEach((element) => {
        if (element.name.substr(0, 1) <= 9) {
          listaCC.push(element.name);
          listaCC.sort();
        }
      });

      listaCC.forEach((element) => {
        var localCC = document.getElementById('CentroCusto');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};
function gerarDadosModal(codigo) {
  localRetorno = document.getElementById('RetornoStatusNF');

  let bodyContent = {
    codigoNF: codigo
  };
  fetch(endpoints.ModalNF, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      // console.log(dados)
      return dados.json();
    })
    .then((dados) => {
      let data = dados;

      var tipoContr =
        data[0].TipoContrato == 'P' ? 'Pagamento Avulso' : 'Recorrente';
      document.getElementById('NumeroSolicitacaoModal').value = data[0].Codigo;
      document.getElementById('ModSolicitante').value = data[0].Solicitante;
      document.getElementById('ModFornecedor').value = data[0].Fornecedor;
      document.getElementById('ModDescricao').value = data[0].Descricao;
      document.getElementById('TipoContrato').value = tipoContr;
      document.getElementById('Deal').value = data[0].Deal;
      document.getElementById('DataPagamento').value = data[0].Data_Pagamento;
      document.getElementById('Observacao').value = data[0].Observacao;
      document.getElementById('Colaborador').value = data[0].Colaborador;
      document.getElementById('NomeAnexo').innerText = data[0].Anexo;
      retornarNFUser = document.getElementById('retornarNFUser').innerText;
      // localRetorno.innerHTML = '<select type="submit" id="StatusNF" name="StatusNF"  class="form-control" style="font-size:13px; margin-bottom: 3%"  disabled>        <option selected >Enviado para pagamento</option>      </select>'

      if (data[0].StatusNF == 'E') {
        localRetorno.innerHTML =
          '<select type="submit" id="StatusNF" name="StatusNF"  class="form-control" style="font-size:13px"  disabled>        <option selected >Enviado para pagamento</option>      </select>';
      } else if (retornarNFUser) {
        localRetorno.innerHTML =
          '<select type="submit" id="StatusNF" name="StatusNF"  class="form-control"  style="font-size:13px"  >        <option selected>Aguardando lançamento no SAP</option>        <option>Enviado para pagamento</option>      </select>';
      } else {
        localRetorno.innerHTML =
          '<select type="submit" id="StatusNF" name="StatusNF"  class="form-control"  style="font-size:13px"  disabled>        <option selected>Aguardando lançamento no SAP</option>        <option>Enviado para pagamento</option>      </select>';
      }
    });
}

function downloadNF() {
  baixar = document.getElementById('baixar');

  var codigoNF = document.getElementById('NumeroSolicitacaoModal').value;

  var arquivo =
    'DCT-' + codigoNF + ' ' + document.getElementById('NomeAnexo').innerText;

  baixar.href = endpoints.downloadNF + arquivo;
}


