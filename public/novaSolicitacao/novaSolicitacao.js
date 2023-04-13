let arquivoAnexo;
let NomeArquivoSemAcento;

$(document).ready(function () {

  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);
  conveniaCentroCusto();
  listar();


});

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
      // Enviardados.arrayNomes = data.recordsets[0];

      // criarCamposAprovacao();
    });
};

const insert = () => {
  // event.preventDefault();

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

  if (!document.querySelector('#fileInput') && !document.querySelector('#linkInput')) {
    document.getElementById('arquivoLinkObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }

  let arquivo = '';
  if (!document.querySelector('#fileInput')) {
    arquivo = '';
  } else {
    arquivo = document
      .querySelector('#fileInput')
      .value.replace('C:\\fakepath\\', '');
  }

  let link = '';

  if (!document.querySelector('#linkInput')) {
    link = '';
  } else {
    link = document.querySelector('#linkInput').value;
  }

  let bodyContent = {
    descricao: descricao,
    quantidade: quantidade,
    centroCusto: centroCusto,
    deal: deal,
    observacao: observacao,
    solicitante: solicitante,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    arquivo: NomeArquivoSemAcento == undefined? '' : NomeArquivoSemAcento,
    linkk: link
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

      window.location.reload();
    });
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
  NomeArquivoSemAcento = fileInput.value.replace('C:\\fakepath\\','').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  // var NomeArquivoSemAcento = arquivoAnexo.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  });
}



// function validarCampos() {

//   buscarValoresCampos()

//   if(!trueColaborador) { listaErros.splice(listaErros.indexOf('Colaborador'), 1) }

//   campos.push("Solicitante",'CentroCusto','Fornecedor' , 'DescServico', 'TipoContrato','valorNF','Deal','Observacao', 'fileInput')

//   for (let i = 0; i < campos.length; i++) {

//       var camposObr = document.querySelector('.obrigatorio-'+campos[i])

//       const busca = listaErros.find(element => element == document.getElementById(campos[i]).id)

//       if (document.getElementById(campos[i]).value == '' && !busca) {

//           const campoObrigatorio = document.querySelector('.' + campos[i])
//           var labelObrigatorio = document.createElement('label')
//           labelObrigatorio.setAttribute('ID', 'obrigatorio');
//           labelObrigatorio.setAttribute('class','obrigatorio-'+campos[i]);
//           labelObrigatorio.textContent = '* Campo obrigatório';
//           campoObrigatorio.appendChild(labelObrigatorio)
//           listaErros.push(campos[i])

//       }

//       else if(camposObr && document.getElementById(campos[i]).value != '')  {
//           camposObr.remove()

//           listaErros.splice(listaErros.indexOf(campos[i]), 1);

//       }

//   }
//   console.log(listaErros)
//   if(listaErros == '' || listaErros == undefined ){
//       this.insertNota()

//   }

// };


function adicionarCampoLink() {
  document.getElementById('anexo').innerHTML = '';
  let campoLink = document.querySelector('#anexo');
  campoLink.innerHTML = `<div class="form-group anexo" style="margin-top: 1%; font-size: 13px">
<label for="exampleFormControlFile1">Anexar Link</label>
<input type="text"  id="linkInput">
</div>`;
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
    });
};

function uploadFile (file, codigoRetornoNF, NomeArquivoSemAcento){
  console.log("Uploading file...");
  const API_ENDPOINT = endpoints.uploadItem+codigoRetornoNF+'/'+NomeArquivoSemAcento;
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
