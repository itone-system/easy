let arquivoAnexo;
let NomeArquivoSemAcento;
let produto = false
let servico = false
let adiantamento = false

$(document).ready(function () {

  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);
  conveniaCentroCusto();
  listar();
  convenia()
document.getElementById('btn-product').click()

});

function trueProduto() {
  produto = true
}
function trueServico() {
  servico = true
}
function trueAdiantamento() {
  adiantamento = true
}

const Enviardados = {
  codigo: 0,
  arraySolicitacao: [],
  arrayNomes: [],
  descricao: '',
  quantidade: '',
  centroCusto: '',
  indexNome: 0,
  indexEmail: 0,
  arrayEmails: [],
  listaErros: [],
  listaUsuarios: []
};

const listar = () => {
  fetch(endpoints.ListarUsuarios, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados);
      return dados.json();
    })
    .then((dados) => {
      const nomes = dados;
      let container = document.getElementById('aprov');

      for (let i = 0; i < nomes.length; i++) {
        let input = document.createElement('input');
        let br = document.createElement('br');
        input.type = 'text';
        input.className = 'form-control';
        input.readOnly = true;
        input.value = nomes[i];
        input.style.fontSize = '12px';
        container.appendChild(input);
        container.appendChild(br);
      }
    });
};

const insert = () => {
  if (produto) {
    const descricao = document.getElementById('Descricao').value;

  if (descricao.length == 0) {
    document.getElementById('descricaoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }

  const quantidade = document.getElementById('Quantidade').value;

  if (quantidade.length == 0) {
    document.getElementById('quantidadeObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  let centroCusto = document.getElementById('CentroCusto').value

  if (centroCusto == 'Selecionar...') {
    document.getElementById('centroCustoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }

  centroCusto = centroCusto.split(/[\.-]/)[0].trim()

  const deal = document.getElementById('Deal').value;

  if (deal.length == 0) {
    document.getElementById('dealObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  const observacao = document.getElementById('Observações').value;

  if (observacao.length == 0) {
    document.getElementById('motivoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  const solicitante = document.getElementById('nomeUser').value;

  const divRadios = document.getElementById('divRadios')

  let link = '';

  if (divRadios.innerHTML.trim() != '') {
    const radioButtons = document.getElementsByName('option')
    let checked = false;

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        checked = true;
        break;
      }
    }
    if (document.querySelector('#divRadiosAdiantamento')) {
      if (!checked) {
        document.getElementById('adiantamentoObrigatorio').innerHTML =
          '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
        return;
      }
    }

    if (!document.querySelector('#fileInput') && !document.querySelector('#linkInput')) {
      document.getElementById('arquivoLinkObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    if (!document.querySelector('#fileInput')) {
      arquivo = '';
    } else {
      arquivo = document
        .querySelector('#fileInput')
        .value.replace('C:\\fakepath\\', '');
    }


    if (!document.querySelector('#linkInput')) {
      link = '';
    } else {
      link = document.querySelector('#linkInput').value;
    }
  }

  let bodyContent = {
    descricao,
    quantidade,
    centroCusto,
    deal,
    observacao,
    solicitante,
    arquivo: NomeArquivoSemAcento == undefined ? '' : NomeArquivoSemAcento,
    linkProduto: link,
    adiantamentoServico: false,
    normalProduto: true,
    normalServico: false
  };

  fetch(endpoints.NovaSolicitacao, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados);
      return dados.json();
    })
    .then((dados) => {
      let data = dados;

      uploadFile(arquivoAnexo, data.codigo, NomeArquivoSemAcento);

      const text =
        ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
      alert(text);

      produto = false
      window.location.reload();
    });
  }
  
  if (servico == true) {
    const descricao = document.getElementById('Descricao').value;

    if (descricao.length == 0) {
      document.getElementById('descricaoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
  
    const centroCusto = document.getElementById('CentroCusto').value;
  
    if (centroCusto == 'Selecionar...') {
      document.getElementById('centroCustoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const deal = document.getElementById('Deal').value;
  
    if (deal.length == 0) {
      document.getElementById('dealObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const observacao = document.getElementById('Observações').value;
  
    if (observacao.length == 0) {
      document.getElementById('motivoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const solicitante = document.getElementById('nomeUser').value;
  
    let bodyContent = {
      descricao: descricao,
      centroCusto: centroCusto,
      deal: deal,
      observacao: observacao,
      solicitante: solicitante,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      adiantamentoServico: false,
      adiantamentoProduto: false,
      normalProduto: false,
      normalServico: true
    };
  
    fetch(endpoints.NovaSolicitacao, {
      method: 'POST',
      body: JSON.stringify(bodyContent),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((dados) => {
        console.log(dados);
        return dados.json();
      })
      .then((dados) => {
        let data = dados;
  
        uploadFile(arquivoAnexo, data.codigo, NomeArquivoSemAcento);
  
        const text =
          ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
        alert(text);
  
        servico = false
        window.location.reload();
      });
  }

  
};

function adicionarCampoArquivo() {
  document.getElementById('anexo').innerHTML = '';
  let campoArquivo = document.querySelector('#anexo');
  campoArquivo.innerHTML = `  <div class="form-group anexo" style="margin-top: 1%; font-size: 13px">
  <label for="exampleFormControlFile1">Anexar Arquivo</label>
  <input type="file" name="file" class="form-control-file" id="fileInput">
</div>`;
  const fileInput = document.querySelector('#fileInput');

  fileInput.addEventListener("change", event => {
    const files = event.target.files;
    arquivoAnexo = files[0]
    NomeArquivoSemAcento = fileInput.value.replace('C:\\fakepath\\', '').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    // var NomeArquivoSemAcento = arquivoAnexo.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  });
}

function insertAdiantamento() {
  if (servico == true && adiantamento == true) {
    const descricao = document.getElementById('Descricao').value;

    if (descricao.length == 0) {
      document.getElementById('descricaoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    // const quantidade = document.getElementById('Quantidade').value;

    // if (quantidade.length == 0) {
    //   document.getElementById('quantidadeObrigatorio').innerHTML =
    //     '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    //   return;
    // }
    const centroCusto = document.getElementById('CentroCusto').value;

    if (centroCusto == 'Selecionar...') {
      document.getElementById('centroCustoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const deal = document.getElementById('Deal').value;

    if (deal.length == 0) {
      document.getElementById('dealObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const observacao = document.getElementById('Observações').value;

    if (observacao.length == 0) {
      document.getElementById('motivoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const solicitante = document.getElementById('nomeUser').value;

    const pix = document.getElementById('linkPix').value
    const valor = document.getElementById('valorModal').value
    const filial = document.getElementById('filial').value
    const dataParaPagamento = document.getElementById('dataModal').value

    let bodyContent = {
      descricao: descricao,
      // quantidade: quantidade,
      centroCusto: centroCusto,
      deal: deal,
      observacao: observacao,
      solicitante: solicitante,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      // arquivo: NomeArquivoSemAcento == undefined ? '' : NomeArquivoSemAcento,
      // linkk: link,
      adiantamentoServico: true,
      normalProduto: false,
      normalServico: false,
      adiantamentoProduto: false,
      pix: pix,
      valor: valor,
      filial: filial,
      dataPagamento: dataParaPagamento


    };

    console.log('valores', bodyContent)

    fetch(endpoints.NovaSolicitacao, {
      method: 'POST',
      body: JSON.stringify(bodyContent),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((dados) => {
        console.log(dados);
        return dados.json();
      })
      .then((dados) => {
        let data = dados;

        uploadFile(arquivoAnexo, data.codigo, NomeArquivoSemAcento);

        const text =
          ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
        alert(text);
        servico = false
        adiantamento = false
        window.location.reload();
      });
  }

  if (produto == true && adiantamento == true) {
    const descricao = document.getElementById('Descricao').value;

    if (descricao.length == 0) {
      document.getElementById('descricaoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const quantidade = document.getElementById('Quantidade').value;

    if (quantidade.length == 0) {
      document.getElementById('quantidadeObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const centroCusto = document.getElementById('CentroCusto').value;

    if (centroCusto == 'Selecionar...') {
      document.getElementById('centroCustoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const deal = document.getElementById('Deal').value;

    if (deal.length == 0) {
      document.getElementById('dealObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const observacao = document.getElementById('Observações').value;

    if (observacao.length == 0) {
      document.getElementById('motivoObrigatorio').innerHTML =
        '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
      return;
    }
    const solicitante = document.getElementById('nomeUser').value;

    const pix = document.getElementById('linkPix').value
    const valor = document.getElementById('valorModal').value
    const filial = document.getElementById('filial').value
    const dataParaPagamento = document.getElementById('dataModal').value

    let bodyContent = {
      descricao: descricao,
      quantidade: quantidade,
      centroCusto: centroCusto,
      deal: deal,
      observacao: observacao,
      solicitante: solicitante,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      // arquivo: NomeArquivoSemAcento == undefined ? '' : NomeArquivoSemAcento,
      // linkk: link,
      adiantamentoServico: false,
      normalProduto: false,
      normalServico: false,
      adiantamentoProduto: true,
      pix: pix,
      valor: valor,
      filial: filial,
      dataPagamento: dataParaPagamento


    };

    console.log('valores', bodyContent)

    fetch(endpoints.NovaSolicitacao, {
      method: 'POST',
      body: JSON.stringify(bodyContent),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((dados) => {
        console.log(dados);
        return dados.json();
      })
      .then((dados) => {
        let data = dados;

        uploadFile(arquivoAnexo, data.codigo, NomeArquivoSemAcento);

        const text =
          ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
        alert(text);
        produto = false
        adiantamento = false
        window.location.reload();
      });
  }


}

function insertNormalServico() {
  const descricao = document.getElementById('Descricao').value;

  if (descricao.length == 0) {
    document.getElementById('descricaoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }

  const centroCusto = document.getElementById('CentroCusto').value;

  if (centroCusto == 'Selecionar...') {
    document.getElementById('centroCustoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  const deal = document.getElementById('Deal').value;

  if (deal.length == 0) {
    document.getElementById('dealObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  const observacao = document.getElementById('Observações').value;

  if (observacao.length == 0) {
    document.getElementById('motivoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }
  const solicitante = document.getElementById('nomeUser').value;


  const filial = document.getElementById('filial').value


  let bodyContent = {
    descricao: descricao,
    centroCusto: centroCusto,
    deal: deal,
    observacao: observacao,
    solicitante: solicitante,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    adiantamentoServico: false,
    normalProduto: false,
    normalServico: true,
    filial: filial,
  };

  console.log('valores', bodyContent)

  fetch(endpoints.NovaSolicitacao, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados);
      return dados.json();
    })
    .then((dados) => {
      let data = dados;

      uploadFile(arquivoAnexo, data.codigo, NomeArquivoSemAcento);

      const text =
        ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
      alert(text);

      window.location.reload();
    });
}

function abrirModal() {

  const itemSolicitado = document.getElementById('Descricao').value
  const quantidade = document.getElementById('Quantidade').value
  const centroDeCusto = document.getElementById('CentroCusto').value
  const deal = document.getElementById('Deal').value
  const motivo = document.getElementById('Observações').value
  const filial = document.getElementById('filial').value

  const itemSolicitadoModal = document.getElementById('DescricaoModal').value = itemSolicitado
  const quantidadeModal = document.getElementById('QuantidadeModal').value = quantidade
  const centroDeCustoModal = document.getElementById('CentroCustoModal').value = centroDeCusto
  const dealModal = document.getElementById('DealModal').value = deal
  const motivoModal = document.getElementById('ObservaçõesModal').value = motivo
  const filialModal = document.getElementById('filialModal').value = filial
  const solicitante = document.getElementById('nomeUser').value;



  $('input[type=radio][name=option]').change(function () {
    if (this.value === '1') {
      $('#modalAdiantamento').trigger('click');
    }

    if (this.value == '2') {
      let divRadios = document.querySelector('#divRadios')
      divRadios.innerHTML = `                <div class="col-md-3">
      <label for="cars">Incluir Link ou arquivo:</label>
        <div class="form-check">
            <input onclick="adicionarCampoLink()" type="radio" id="Sim" name="fav_language" value="Sim">
            <label for="Sim">Link</label><br>
            <input onclick="adicionarCampoArquivo()" type="radio" id="Não" name="fav_language" value="Não">
            <label for="Não">Arquivo</label><br>
          <div id="arquivoLinkObrigatorio"></div>
        </div>
    </div>
`
    }
  });



};

function adicionarCampoLink() {
  document.getElementById('anexo').innerHTML = '';
  let campoLink = document.querySelector('#anexo');
  campoLink.innerHTML = `<div class="form-group form-control anexo" style="margin-top: 1%; font-size: 13px">
<label for="exampleFormControlFile1">Anexar Link</label>
<input type="text"  id="linkInput">
</div>`;
}

function adicionarCampoBoleto() {
  document.getElementById('pixDiv').innerHTML = '';
  let campoLink = document.querySelector('#pixDiv');
  campoLink.innerHTML = `  <div class="form-group anexo" style="margin-top: 1%; font-size: 13px">
  <label for="exampleFormControlFile1">Anexar Arquivo</label>
  <input type="file" name="file" class="form-control-file" id="fileInput">
</div>`;
}

function adicionarCampoPix() {
  // document.getElementById('pixDiv').innerHTML = '';
  let campoLink = document.querySelector('#pixDiv');
  campoLink.innerHTML = ` <div class="form-group" style="margin-top: 1%; font-size: 13px">
  <label for="exampleFormControlFile1">Digite o Pix</label>
  <input type="text" class="form-control"  id="linkPix">
  </div>`;
}
function incluirCamposAdiantamento() {
  document.getElementById('divRadios').innerHTML = ''
  const check = document.getElementById('falseAdiantamento')
  check.checked = false
  const div = document.getElementById('adiantamento')
  div.innerHTML = `  <div class="row g-3">
  <div class="col CentroCusto">
    <label id="MotivoLabel">Valor:</label>
    <input id="valorModal" type="text" class="form-control emailText" placeholder="Observações"
      aria-label="First name" name="observacao">
      <div id="motivoObrigatorio"></div>
  </div>

  <div class="col Deal">
    <label id="MotivoLabel">Data para pagamento:</label>
    <input id="dataModal" type="date" class="form-control emailText" placeholder="Observações"
      aria-label="First name" name="observacao" id="dataPagamento">
      <div id="dataPagamento"></div>
  </div>


</div>`
  const divCheckboxes = document.getElementById("checkboxes");
  divCheckboxes.innerHTML = ''
  // const divPix
  const label0 = document.createElement("label");
  label0.htmlFor = "labelPixBoleto"
  label0.appendChild(document.createTextNode("Incluir: "));
  const checkbox1 = document.createElement("input");
  checkbox1.type = "checkbox";
  checkbox1.id = "opcao1";
  checkbox1.name = "opcoes";
  // checkbox1.onclick=
  checkbox1.setAttribute("onclick", "adicionarCampoPix()")

  const label1 = document.createElement("label");
  label1.htmlFor = "opcao1";
  label1.appendChild(document.createTextNode("Pix"));

  const checkbox2 = document.createElement("input");
  checkbox2.type = "checkbox";
  checkbox2.id = "opcao2";
  checkbox2.name = "opcoes";
  checkbox2.setAttribute("onclick", "adicionarCampoBoleto()")
  const label2 = document.createElement("label");
  label2.htmlFor = "opcao2";
  label2.appendChild(document.createTextNode("Boleto"));

  divCheckboxes.appendChild(label0);
  divCheckboxes.appendChild(document.createElement("br"));
  divCheckboxes.appendChild(checkbox1);
  divCheckboxes.appendChild(label1);
  divCheckboxes.appendChild(document.createElement("br"));
  divCheckboxes.appendChild(checkbox2);
  divCheckboxes.appendChild(label2);
}

function removerCamposAdiantamento() {
  const divCheckboxes =  document.getElementById('checkboxes').innerHTML = ''
  const divRadios = document.getElementById('divRadios').innerHTML = `<div id="testRadios">
  <label for="cars">Incluir Link ou arquivo:</label>
    <div class="">
        <input onclick="adicionarCampoLink()" type="radio" id="Sim" name="fav_language" value="Sim">
        <label for="Sim">Link</label><br>
        <input onclick="adicionarCampoArquivo()" type="radio" id="Não" name="fav_language" value="Não">
        <label for="Não">Arquivo</label><br>
      <div id="anexo"></div>
      <div id="arquivoLinkObrigatorio"></div>
    </div>
</div>`
  const check = document.getElementById('trueAdiantamento')
  check.checked = false
  const div = document.getElementById('adiantamento').innerHTML = ''
  document.getElementById('idbotaoSolicitar').innerHTML = `<button style="margin-top: 0.5%" onclick="insert()" type="submit" name="inserir" id="botao-solicitar"
class=" button2">Solicitar</button>`
}

function incluirCamposServicos() {
  document.getElementById('divRadios').innerHTML = ''
  const primeiraLinha = document.getElementById('primeiraLinha')

  primeiraLinha.innerHTML = `<div class="col Descricao">
   <label>Serviço:</label>
   <input id="Descricao" for="Descricao" type="text" class="form-control mandatory" placeholder="Descricao Item"
     name="descricao">
     <div id="descricaoObrigatorio"></div>

 </div>
 <div class="col Quantidade">
 <label>Deal:</label>
 <input id="Deal" for="Quantidade" type="text" class="form-control" placeholder="Caso não tenha, informe o número 1" name="deal">
 <div id="dealObrigatorio"></div>
 </div>`

  const segundaLinha = document.getElementById('segundaLinha')
  segundaLinha.innerHTML = ` <div class="col CentroCusto">
 <label>Centro de Custo:</label>
 <select id="CentroCusto" class="form-control" name="centroCusto">
   <option selected>Selecionar...</option>

 </select>
 <div id="centroCustoObrigatorio"></div>
</div>




<div class="col Deal">
 <label>Filial:</label>
 <input id="Deal" for="Quantidade" type="text" class="form-control" placeholder="Caso não tenha, informe o número 1" name="deal">
 <div id="dealObrigatorio"></div>
</div>`

  const terceiraLinha = document.getElementById('terceiraLinha')
  terceiraLinha.innerHTML = ` <div class="col CentroCusto">
<label id="MotivoLabel">Motivo:</label>
<input id="Observações" type="text" class="form-control emailText" placeholder="Observações"
  aria-label="First name" name="observacao">
  <div id="motivoObrigatorio"></div>
</div>

<div class="col Deal">
<label id="MotivoLabel">Filial de Entrega:</label>
<select id="filial" class="form-control" name="centroCusto">
  <option selected>Selecionar...</option>

</select>
  <div id="motivoObrigatorio"></div>
</div>`
  conveniaCentroCusto()
  convenia()
  document.getElementById('btn-product').classList.remove('active2');
  document.getElementById('btn-service').classList.toggle('active2');

}

function alterarBotaoSolicitar() {
  document.getElementById('idbotaoSolicitar').innerHTML = ` <button style="margin-top: 0.5%" onclick="insertAdiantamento()" type="submit" name="inserir" id="botao-solicitar"
  class=" button2">Solicitar</button>`
}

function removerCamposServicos() {
    document.getElementById('divRadios').innerHTML = ` <div id="testRadios">
    <label for="cars">Incluir Link ou arquivo:</label>
      <div class="">
          <input onclick="adicionarCampoLink()" type="radio" id="Sim" name="fav_language" value="Sim">
          <label for="Sim">Link</label><br>
          <input onclick="adicionarCampoArquivo()" type="radio" id="Não" name="fav_language" value="Não">
          <label for="Não">Arquivo</label><br>
        <div id="anexo"></div>
        <div id="arquivoLinkObrigatorio"></div>
      </div>
  </div>`
  const primeiraLinha = document.getElementById('primeiraLinha')

  primeiraLinha.innerHTML = `<div class="col Descricao">
   <label>Item Solicitado:</label>
   <input id="Descricao" for="Descricao" type="text" class="form-control mandatory" placeholder="Descricao Item"
     name="descricao">
     <div id="descricaoObrigatorio"></div>

 </div>
 <div class="col Quantidade">
                  <label>Quantidade:</label>
                  <input id="Quantidade" for="Quantidade" type="text" class="form-control" placeholder="N°"
                    name="quantidade">
                    <div id="quantidadeObrigatorio"></div>
                </div>`

  const segundaLinha = document.getElementById('segundaLinha')
  segundaLinha.innerHTML = `  <div class="col CentroCusto">
  <label>Centro de Custo:</label>
  <select id="CentroCusto" class="form-control" name="centroCusto">
    <option selected>Selecionar...</option>

  </select>
  <div id="centroCustoObrigatorio"></div>
</div>




<div class="col Deal">
  <label>Deal:</label>
  <input id="Deal" for="Quantidade" type="text" class="form-control" placeholder="Caso não tenha, informe o número 1" name="deal">
  <div id="dealObrigatorio"></div>
</div>`

  const terceiraLinha = document.getElementById('terceiraLinha')
  terceiraLinha.innerHTML = ` <div class="col CentroCusto">
<label id="MotivoLabel">Motivo:</label>
<input id="Observações" type="text" class="form-control emailText" placeholder="Observações"
  aria-label="First name" name="observacao">
  <div id="motivoObrigatorio"></div>
</div>

<div class="col Deal">
<label id="MotivoLabel">Filial de Entrega:</label>
<select id="filial" class="form-control" name="centroCusto">
  <option selected>Selecionar...</option>

</select>
  <div id="motivoObrigatorio"></div>
</div>`
  conveniaCentroCusto()
  convenia()
  document.getElementById('btn-service').classList.remove('active2');
  document.getElementById('btn-product').classList.toggle('active2');
}

const retonarCodigo = () => {
  var listaUsuarios = [];
  const emailSelecionado = document.querySelectorAll('.email');

  for (let i = 0; i < emailSelecionado.length; i++) {
    var inputEmail = document.getElementById('E-mail' + i);

    for (let i = 0; i < Enviardados.arrayNomes.length; i++) {
      if (Enviardados.arrayNomes[i].EMAIL_USUARIO == inputEmail.value) {
        listaUsuarios.push(Enviardados.arrayNomes[i].COD_USUARIO);
      }
    }
  }
  return listaUsuarios.toString();
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
      console.log(listaCC)
    });
};

function clearOptions() {
  let radios = document.getElementsByName('option');
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = false;
  }
}

function uploadFile(file, codigoRetornoNF, NomeArquivoSemAcento) {
  console.log("Uploading file...");
  const API_ENDPOINT = endpoints.uploadItem + codigoRetornoNF + '/' + NomeArquivoSemAcento;
  const request = new XMLHttpRequest();
  const formData = new FormData();

  request.open("POST", API_ENDPOINT, true);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      console.log(request.responseText);
    }
  };
  formData.append("file", file);
  request.send(formData);
};

function convenia() {
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
          if (element.name == '1000 - BELO HORIZONTE/MG') {
            listaCC.push('BELO HORIZONTE-MG');
          }
          if (element.name == '4000 - BRASILIA/DF') {
            listaCC.push('BRASILIA-DF');
          }
          if (element.name == '5000 - SÃO PAULO/SP') {
            listaCC.push('SÃO PAULO-SP');
          }
          if (element.name == '7000 - DOMINGOS MARTINS/ES') {
            listaCC.push('DOMINGOS MARTINS-ES');
          }
          listaCC.sort();
        }
      });
      console.log(listaCC)
      listaCC.forEach((element) => {
        var localCC = document.getElementById('filial');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};
