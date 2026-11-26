const chave = 'meusRegistros';
const imgprodutos = ['banana', 'amora', 'morango', 'abacate', 'melancia'];
document.getElementById('codigo').value = gerarCodigo4Digitos();

let altId = null;

function converterTudoNaoNumeroEmNada() {
  document.getElementById("preco").value = document.getElementById("preco").value.replace(/[^0-9]/g, "");
}

function carregarRegistros() {
  const registros = localStorage.getItem(chave);
  return registros ? JSON.parse(registros) : []; // operador ternário
}

function salvarRegistros(registros) {
  localStorage.setItem(chave, JSON.stringify(registros));
}

function gerarCodigo4Digitos() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';

  for (let i = 0; i < 4; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    resultado += caracteres.charAt(indiceAleatorio);
  }

  return resultado;
}

function verificarImagem() {
  const inputFoto = document.getElementById("tfoto");
  const imgElement = document.getElementById("imagem");
  const valorFoto = inputFoto.value.trim().toLowerCase();

  
  if (valorFoto === "") {
    imgElement.src = "";
    imgElement.classList.add("hidden");
    return;
  }

  
  imgElement.classList.remove("hidden");

  if (imgprodutos.includes(valorFoto)) {
    imgElement.src = "img/" + valorFoto + ".png";
  } else {
    imgElement.src = "img/sem_imagem.png";
  }
}

function renderizarTabela() {
  const tbody = document.querySelector('#tabelaRegistros tbody');
  tbody.innerHTML = ''; // limpa

  const registros = carregarRegistros();
  if (registros.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7">Nenhum registro</td>';
    tbody.appendChild(tr);
    return;
  }

  registros.forEach(reg => {
    const tr = document.createElement('tr');
    
    
    const nomeFoto = reg.tfoto ? reg.tfoto.trim().toLowerCase() : "";
    
    
    const temImagem = imgprodutos.includes(nomeFoto);
    const caminhoImg = temImagem ? "img/" + nomeFoto + ".png" : "img/sem_imagem.png";

    tr.innerHTML = `
      <td>${escapeHtml(reg.codigo)}</td>
      <td>${escapeHtml(reg.produto)}</td>
      <td>${escapeHtml(reg.descricao)}</td>
      <td>R$${escapeHtml(reg.preco)}</td>
      <td>${escapeHtml(reg.tfoto)}</td>
      <td><img src="${caminhoImg}" width="50" alt="Foto"></td>
      <td>
        <button data-id="${reg.id}" class="btn-editar">Editar</button>
        <button data-id="${reg.id}" class="btn-excluir">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-editar').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      carregarRegistroNoFormulario(id);
    });
  });

  tbody.querySelectorAll('.btn-excluir').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Excluir este registro?')) {
        excluirRegistro(id);
      }
    });
  });
}


function carregarRegistroNoFormulario(id) {
  const registros = carregarRegistros();
  const reg = registros.find(r => r.id === id);
  if (!reg) {
    alert('Registro não encontrado.');
    return;
  }

  document.getElementById('registroId').value = reg.id;
  document.getElementById('produto').value = reg.produto;
  document.getElementById('codigo').value = reg.codigo;
  document.getElementById('descricao').value = reg.descricao;
  document.getElementById('preco').value = reg.preco;
  document.getElementById('tfoto').value = reg.tfoto;
  
  altId = reg.id;
  document.getElementById('btnSalvar').textContent = 'Salvar alterações';
  
  
  document.getElementById('btnCancelar').classList.remove('hidden');
  
  
  verificarImagem();
}

// --- Inserir novo registro ---
function inserirRegistro(dados) {
  const registros = carregarRegistros();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  registros.push({ id, ...dados });
  salvarRegistros(registros);
}


function excluirRegistro(id) {
  let registros = carregarRegistros();
  registros = registros.filter(r => r.id !== id);
  salvarRegistros(registros);
  if (altId === id)
    resetFormulario();
  renderizarTabela();
}


function resetFormulario() {
  document.getElementById('formRegistro').reset();
  document.getElementById('registroId').value = '';
  altId = null;

  document.getElementById('btnSalvar').textContent = 'Salvar';
  document.getElementById('btnCancelar').classList.add('hidden');
  document.getElementById("imagem").src = "";
  document.getElementById("imagem").classList.add("hidden");
}


function atualizarRegistro(id, novosDados) {
  const registros = carregarRegistros();
  const idx = registros.findIndex(r => r.id === id);
  if (idx === -1) {
    alert('Registro para atualizar não foi encontrado.');
    return;
  }
  registros[idx] = { id, ...novosDados };
  salvarRegistros(registros);
}


function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


document.getElementById('formRegistro').addEventListener('submit', function (e) {
  e.preventDefault();
  const produto = document.getElementById('produto').value.trim();
  const codigo = document.getElementById('codigo').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const preco = Number(document.getElementById('preco').value.trim());
  const tfoto = document.getElementById('tfoto').value.trim();

  if (!produto || !codigo || !descricao || isNaN(preco) || !tfoto) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const dados = { produto, codigo, descricao, preco, tfoto };

  if (altId) {
    
    atualizarRegistro(altId, dados);
    alert('Registro atualizado.');
  } else {
    
    inserirRegistro(dados);
    alert('Registro salvo.');
  }

  resetFormulario();
  renderizarTabela();
  document.getElementById('codigo').value = gerarCodigo4Digitos();
});


document.getElementById('btnCancelar').addEventListener('click', function () {
  if (confirm('Cancelar edição?')) {
    resetFormulario();
    document.getElementById('codigo').value = gerarCodigo4Digitos();
  }
});


renderizarTabela();