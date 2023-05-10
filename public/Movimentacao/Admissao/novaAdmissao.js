// 

function validarFormulario(event) {
    // impede o envio automático do formulário
    event.preventDefault();

    // obtém os campos obrigatórios
    const camposObrigatorios = document.querySelectorAll('[required]');

    // percorre os campos obrigatórios verificando se estão preenchidos
    let camposPreenchidos = true;
    camposObrigatorios.forEach(campo => {
        if (campo.value === '') {
            camposPreenchidos = false;
            // exibe uma mensagem de erro para o campo vazio
            const label = campo.parentNode.querySelector('.campo');
            if (label) {
                label.textContent = '* Campo obrigatório (preencha este campo)';
                label.style.color = 'red';
            }
        } else {
            // remove a mensagem de erro do campo preenchido
            const label = campo.parentNode.querySelector('.campo');
            if (label) {
                label.textContent = '* Campo obrigatório';
                label.style.color = 'black';
            }
        }
    });

    // se algum campo obrigatório não estiver preenchido, impede o envio do formulário
    if (!camposPreenchidos) {
        enviarDados(event)
    } else {
        enviarDados(event)
    }

    // envia o formulário se todos os campos obrigatórios estiverem preenchidos
    // event.target.submit();
}

window.onload = () => {
    const toggle = body.querySelector(".toggle")
    const clickEvent = new MouseEvent('click');
    toggle.dispatchEvent(clickEvent);

    conveniaCentroCusto()
    conveniaColaborares()

    // Selecionar botão de enviar
    // const enviarForm = document.querySelector("#botaoEnviar");

    // executar função quando clicar
    // enviarForm.addEventListener("click", function () {
    //     //busca os valores para validar as informações
    //     if (buscarvalores() == true) {
    //         //limpa o campos inseridos após o envio das informações
    //         limparForms();
    //     } else {
    //         console.log("Formulario Incompleto");
    //     }
    // })


};

function enviarDados(event) {
    event.preventDefault()
    const form = document.querySelector('form'); // seleciona o formulário pelo seletor CSS
    const inputs = form.querySelectorAll('input, select'); // seleciona todos os inputs e selects dentro do formulário
    const valores = {}; // objeto para armazenar os valores capturados
  
    // percorre todos os inputs e selects e captura seus valores
    inputs.forEach(input => {
      const nome = input.name; // pega o nome do input
      const tipo = input.type; // pega o tipo do input
      let valor; // variável para armazenar o valor do input
  
      // verifica o tipo do input e captura seu valor de acordo com o tipo
      switch (tipo) {
        case 'radio':
          if (input.checked) {
            valor = input.value;
          }
          break;
        case 'checkbox':
          valor = input.checked;
          break;
        default:
          valor = input.value;
          break;
      }
  
      // adiciona o valor capturado ao objeto de valores, usando o nome do input como chave
      valores[nome] = valor;
    });
  
    console.log(valores); // exibe os valores capturados no console


    fetch(endpoints.insertVaga, {
        method: 'POST',
        body: JSON.stringify(valores),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then((dados) => {
          return dados.json();
        })
        .then((dados) => {
          if (dados) {
            alert('Vaga N° ' + dados + ' Aberta com Sucesso');
          }
          window.location.reload();
        });
}

// // Função será executada após clicar no botão Enviar
// function buscarvalores() {

//     const tipoAdm = document.getElementById('tipoAdmissao')
//     const empSubstituido = document.getElementById('empSubs')
//     const uniContratacao = document.getElementById('unidadeContratacao')

//     const selectSubstituto = document.querySelector("input[name='radio01']:checked")
//     const departamento = document.getElementById('opcaoDepartamento')
//     const centroCustos = document.getElementById('opcaocentroCustos')
//     const salario = document.getElementById('salario')
//     const cargo = document.getElementById('cargo')
//     const gestor = document.getElementById('gestor')
//     var hrTrabalho = document.getElementById('hrTrabalho')
//     var cliente = document.getElementById('cliente')
//     var deal = document.getElementById('deal')

//     var tipoEqui = document.querySelector("input[name='radio02']:checked")
//     var CarVisita = document.querySelector("input[name='radio03']:checked")
//     var CelCorporativo = document.querySelector("input[name='radio04']:checked")
//     var UsuSimilar = document.getElementById('usuarioSimilar')
//     var AcessEspecifico = document.getElementById('acessEspecifico')

//     var nomeCompleto = document.getElementById('nomeCompleto')
//     var tutor = document.getElementById('tutor')
//     var telPessoal = document.getElementById('telPessoal')
//     var emailPessoal = document.getElementById('emailPessoal')
//     var indicPremiada = document.getElementById('indicPremiada')
//     var emailCorporativo = document.getElementById('emailCorporativo')
//     var pcb = document.querySelector('input[name=radio05]:checked')
//     var dateInicio = document.getElementById('dateInicio')
//     var mdtrabalho = document.getElementById('mdtrabalho')
//     var escalaSobraviso = document.querySelector('input[name=radio06]:checked')
//     var treinamento = document.getElementById('treinamento')
//     var ObsGeral = document.getElementById('textareaOBS')

//     if (validarCampos() == false) {
//         alert("Favor, verificar os campos obrigatórios.");
//         console.log("Favor, verificar os campos obrigatórios.")
//         return;
//     } else {
//         console.log("\nTipo de Admissão: " + tipoAdm.value)
//         console.log("Substituição: " + selectSubstituto.value)
//         if (habilitarCampoSubstituicao() == true) {
//             console.log("Empregado Substituído: " + empSubstituido.value.trim())
//         }
//         console.log("Unidade de Contratacao: " + uniContratacao.value.trim())
//         console.log("Departamento: " + departamento.value)
//         console.log("Centro de Custos: " + centroCustos.value)
//         if (validarSalario() == false) {
//             alert("Salario não pode ser menor")
//             return;
//         } else {
//             console.log("Salario: " + salario.value.trim())
//             console.log("Cargo: " + cargo.value.trim())
//             console.log("Gestor: " + gestor.value.trim())
//             console.log("Horario: " + hrTrabalho.value)
//             console.log("Client: " + cliente.value.trim())
//             console.log("Deal: " + deal.value.trim())
//             console.log("Equipamento: " + tipoEqui.value)
//             console.log("Cartao de Visita: " + CarVisita.value)
//             console.log("Celular Corporativo: " + CelCorporativo.value)
//             console.log("Usuario Similar Ativo: " + UsuSimilar.value.trim())
//             console.log("Acessos Específicos: " + AcessEspecifico.value.trim())

//             console.log("Nome: " + nomeCompleto.value.trim())
//             console.log("Tutor: " + tutor.value.trim())
//             console.log("Telefone Pessoal: " + telPessoal.value.trim())
//             console.log("Email pessoal: " + emailPessoal.value.trim())
//             console.log("Indicação Premiada: " + indicPremiada.value.trim())
//             console.log("Email corporativo: " + emailCorporativo.value.trim())
//             console.log("PCB: " + pcb.value)
//             console.log("Data Inicio: " + dateInicio.value)
//             console.log("Modalidade Trabalho: " + mdtrabalho.value.trim())
//             console.log("Escala sobreaviso: " + escalaSobraviso.value)
//             console.log("Treinamento: " + treinamento.value)
//             console.log("Observação Geral: " + ObsGeral.value.trim())

//             alert("Todos os campos corretamente enviados");
//             enviarFormulario()
//             return true;
//         }
//     }
// }

// // Função só será executada após todos os campos serem validados
// function enviarFormulario() {
//     console.log("\nInformações Enviadas com sucessos")
// }

// // Função limpará todo o formulário apos o envio de informações
// function limparForms() {
//     document.querySelector('form').reset();
// }

// //Função para mostrar o erro
// function showError(index) {
//     const campos = document.querySelectorAll(".campo");
//     campos[index].style.display = "block";
// }

// //Função para ocultar o erro
// function removeError(index) {
//     const campos = document.querySelectorAll(".campo");
//     campos[index].style.display = "";
// }

// // Verificar a validação de todos os campos  
// function validarCampos() {

//     listCampos = ['tipoAdmissao', 'radio01', 'empSubs', 'unidadeContratacao', 'opcaoDepartamento',
//         'opcaocentroCustos', 'salario', 'cargo', 'gestor', 'hrTrabalho', 'client', 'deal',
//         'radio02', 'radio03', 'radio04', 'usuarioSimilar', 'acessEspecifico', 'nomeCompleto', 'tutor',
//         'telPessoal', 'emailPessoal', 'indicPremiada', 'emailCorporativo', 'radio05', 'dateInicio',
//         'mdtrabalho', 'radio06', 'treinamento']

//     for (let i = 0; i < listCampos.length; i++) {

//         if (listCampos[i].substr(0, 5) == 'radio') {
//             campo = document.getElementsByName(listCampos[i])
//             radio = true
//         } else {
//             campo = document.getElementById(listCampos[i])
//             radio = false
//         }

//         if (radio && campo[1].checked && listCampos[i] == "radio01") {
//             i++;
//         }
//         console.log(campo)
//         if (!radio && campo.value.trim() == "") {
//             console.log(1);
//             showError(i);
//             return false;
//         }
//         else if (radio && !campo[0].checked && !campo[1].checked) {
//             console.log(2);
//             showError(i);
//             return false;
//         }
//         else {
//             removeError(i);
//         }
//     }
//     return true
// }

// function validarSalario() {
//     const salario = document.getElementById("salario")
//     if (parseFloat(salario.value.trim()) <= parseFloat(0)) {
//         return false;
//     } else {
//         return true;
//     }
// }

function desabilitarCampoSubstituicao() {
    document.getElementById("ColaboradorInsert").disabled = true;
}

function habilitarCampoSubstituicao() {
    document.getElementById("ColaboradorInsert").disabled = false;
    return true;
}

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
                var localCC = document.getElementById('centroCusto');
                var option = document.createElement('option');
                option.textContent = element;
                localCC.appendChild(option);
            });
        });
};

function verificarOpcaoSelecionada(elementoSelect) {
    const opcaoSelecionada = elementoSelect.options[elementoSelect.selectedIndex].value;

    if (opcaoSelecionada == 'Recursos Dedicado') {
        document.getElementById('cliente').disabled = false;
        document.getElementById('deal').disabled = false;
    }
    if (opcaoSelecionada != 'Recursos Dedicado') {
        document.getElementById('cliente').disabled = true;
        document.getElementById('deal').disabled = true;
    }
}

function formatarMoeda() {
    var elemento = document.getElementById('valor');
    var valor = elemento.value;

    valor = valor + '';
    valor = parseInt(valor.replace(/[\D]+/g, ''));
    valor = valor + '';
    valor = valor.replace(/([0-9]{2})$/g, ",$1");

    if (valor.length > 6) {
        valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    }

    elemento.value = valor;
    if (valor == 'NaN') elemento.value = '';
}

function getFormValues() {
    const formValues = {};
    const formInputs = document.querySelectorAll("input, select");

    formInputs.forEach((input) => {
        const { name, value } = input;
        formValues[name] = value;
    });
    console.log(formValues)
    // return formValues;
}
// function desabilitar2Campos() {
//     var custo = document.getElementById('opcaocentroCustos')

//     if (custo.value != "Recursos Dedicado") {
//         document.getElementById('cliente').disabled = true;
//         document.getElementById('deal').disabled = true;
//     } else {
//         document.getElementById('cliente').disabled = false;
//         document.getElementById('deal').disabled = false;
//     }
// }

const conveniaColaborares = () => {

    fetch("https://public-api.convenia.com.br/api/v3/employees", {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "token": "82856aeb-fa11-4918-b2bc-f7a49322f69b"
      }
    }).then(response => {
      return response.json()
    }).then(result => {
      var dados = result.data
      let listaColab = []
  
      dados.forEach(element => {
        listaColab.push(element.name + ' ' + element.last_name)
        listaColab.sort()
      });
  
      listaColab.forEach(element => {
        var localColab = document.getElementById('ColaboradorInsert')
        var option = document.createElement('option');
        option.textContent = element;
        localColab.appendChild(option);
  
      });
    })
  
  }

