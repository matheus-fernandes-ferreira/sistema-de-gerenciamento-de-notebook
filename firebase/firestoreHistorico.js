import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiFzkz8fypa5R29cdNvIDGyBMTGD9mfs8",
  authDomain: "sistema-de-notebooks.firebaseapp.com",
  databaseURL: "https://sistema-de-notebooks-default-rtdb.firebaseio.com",
  projectId: "sistema-de-notebooks",
  storageBucket: "sistema-de-notebooks.firebasestorage.app",
  messagingSenderId: "80287744691",
  appId: "1:80287744691:web:53b1056f5530a3d695a6c6",
  measurementId: "G-0T0Q5SB2C7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Temporizador de inatividade
let inactivityTimer;

// Função para reiniciar o temporizador de inatividade
function resetInactivityTimer() {
  clearTimeout(inactivityTimer); // Limpa o temporizador atual
  inactivityTimer = setTimeout(logoff, 5 * 60 * 1000); // 5 minutos
}

// Função de logoff
function logoff() {
  // Remove a matrícula do localStorage
  sessionStorage.removeItem("matricula");

  // Redireciona o usuário para a página de login
  window.location.href = "login.html";
}

// Detectar atividade do usuário
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keydown", resetInactivityTimer);
document.addEventListener("touchstart", resetInactivityTimer);

// Iniciar o temporizador de inatividade ao carregar a página
resetInactivityTimer();

// Lista de meses
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julio", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Índice do mês atual
let mesAtualIndex = new Date().getMonth(); // Mês atual (0-11)

// Função para carregar os dados do usuário e verificar o cargo
async function loadUserData() {
  const matricula = sessionStorage.getItem("matricula"); // Pega a matrícula do localStorage

  if (!matricula) {
    alert('Você precisa fazer login primeiro.');
    window.location.href = "login.html"; // Redireciona para o login se não estiver autenticado
    return;
  }

  const colaboradoresRef = collection(db, "colaboradores");
  const q = query(colaboradoresRef, where("matricula", "==", matricula));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verifica o cargo do usuário
      if (userData.cargo === "coordenador") {
        // Mostra o link do menu para notebooks
        document.getElementById("notebook-link").style.display = "flex";
      } else {
        // Oculta o link do menu para notebooks
        document.getElementById("notebook-link").style.display = "none";
      }
    } else {
      alert('Usuário não encontrado.');
    }
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
  }
}

// Função para atualizar o mês exibido no carrossel
function atualizarMesCarrossel() {
  document.getElementById('mes-atual').textContent = meses[mesAtualIndex];
  fetchReservas(); // Atualiza a tabela com as reservas do mês selecionado
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const tableBody = document.getElementById("reservas-body");

  searchInput.addEventListener("input", function () {
    const termo = searchInput.value.toLowerCase();
    filtrarTabela(termo);
  });

  function filtrarTabela(termo) {
    const linhas = tableBody.getElementsByTagName("tr");

    for (let linha of linhas) {
      const nome = linha.cells[0]?.textContent.toLowerCase() || "";
      const data = linha.cells[1]?.textContent.toLowerCase() || "";
      const turma = linha.cells[2]?.textContent.toLowerCase() || "";

      if (nome.includes(termo) || data.includes(termo) || turma.includes(termo)) {
        linha.style.display = "";
      } else {
        linha.style.display = "none";
      }
    }
  }
});

// Função para filtrar as reservas pelo mês selecionado
function filtrarReservasPorMes(reservas, mesIndex) {
  return reservas.filter(reserva => {
    const dataReserva = reserva.data?.seconds ? new Date(reserva.data.seconds * 1000) : new Date(reserva.data);
    return dataReserva.getMonth() === mesIndex;
  });
}

// Função para buscar as reservas do histórico
async function fetchReservas() {
  try {
    // Mostra o spinner
    document.getElementById("loading-overlay").style.display = "block";

    const historicoCollection = collection(db, "historico");
    const historicoSnapshot = await getDocs(historicoCollection);

    // Filtra as reservas que possuem a coluna "entregue" OU o status "cancelado"
    const reservasList = historicoSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })) // Inclui o ID do documento
      .filter(reserva => reserva.entregue || reserva.status === "cancelado"); // Inclui reservas canceladas

    // Filtra as reservas pelo mês selecionado
    const reservasFiltradas = filtrarReservasPorMes(reservasList, mesAtualIndex);

    // Ordena as reservas por data
    reservasFiltradas.sort((a, b) => {
      const dataA = a.data?.seconds ? new Date(a.data.seconds * 1000) : new Date(a.data);
      const dataB = b.data?.seconds ? new Date(b.data.seconds * 1000) : new Date(b.data);
      return dataA - dataB; // Ordena do mais antigo para o mais recente
    });

    const tableBody = document.getElementById('reservas-body');
    tableBody.innerHTML = ''; // Limpa o conteúdo atual

    reservasFiltradas.forEach(reserva => {
      let dataFormatada = reserva.data;

      // Se a data for um timestamp do Firebase, converter para Date
      if (dataFormatada && dataFormatada.seconds) {
        dataFormatada = new Date(dataFormatada.seconds * 1000);
      } else if (typeof dataFormatada === "string") {
        dataFormatada = new Date(dataFormatada); // Converte string ISO para Date
      }

      // Formata para DD/MM/AAAA
      const dataFinal = dataFormatada
        ? dataFormatada.toLocaleDateString("pt-BR", { timeZone: "UTC" })
        : "Data inválida";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reserva.nome}</td>
        <td>${dataFinal}</td>
        <td>${reserva.horaInicio} - ${reserva.horaFim}</td>
        <td>${reserva.quantidade}</td>
        <td>
          <button class="btn-details">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="35" height="20">
              <path fill="#c9c9c9" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
            </svg>
          </button>
        </td>
        <td>
          <button class="btn-delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="35" height="20">
              <path fill="#ffffff" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);

      // Adiciona o event listener ao botão de detalhes
      const btnDetails = row.querySelector('.btn-details');
      btnDetails.addEventListener('click', () => {
        Swal.fire({
          title: `Detalhes da Reserva`,
          html: `
            <div class="reserva-grid">
              <div class="info-box">
                <p><strong>Nome:</strong> <br> ${reserva.nome}</p>
              </div>
              <div class="info-box">
                <p><strong>Matrícula:</strong> <br> ${reserva.matricula}</p>
              </div>
              <div class="info-box">
                <p><strong>Turma:</strong> <br> ${reserva.turma}</p>
              </div>
              <div class="info-box">
                <p><strong>Data:</strong> <br> ${dataFinal}</p>
              </div>
              <div class="info-box">
                <p><strong>Horário:</strong> <br> ${reserva.horaInicio} - ${reserva.horaFim}</p>
              </div>
              <div class="info-box">
                <p><strong>Quantidade:</strong> <br> ${reserva.quantidade}</p>
              </div>
              <div class="info-box">
                <p><strong>Status:</strong> <br> ${reserva.status}</p>
              </div>
              <div class="info-box" id="entrega-box">
                <p><strong>Entrega:</strong> <br> <span class="truncate-text">${reserva.entregue}</span></p>
              </div>
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Fechar',
          confirmButtonColor: '#3085d6',
          customClass: {
            popup: 'swal2-popup',
            title: 'swal2-title',
            htmlContainer: 'swal2-html-container',
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
            icon: 'swal2-icon'
          },
          didOpen: () => {
            const entregaBox = document.getElementById('entrega-box');
            const truncateText = entregaBox.querySelector('.truncate-text');

            // Verifica se o navegador suporta -webkit-line-clamp
            const supportsLineClamp = typeof truncateText.style.webkitLineClamp !== 'undefined';

            if (!supportsLineClamp) {
              // Trunca o texto manualmente para navegadores que não suportam -webkit-line-clamp
              const originalText = truncateText.textContent;
              const maxLength = 100; // Defina o comprimento máximo do texto truncado
              if (originalText.length > maxLength) {
                truncateText.textContent = originalText.slice(0, maxLength) + '...';
              }
            }

            // Adiciona o evento de clique para expandir a caixa de "Entrega"
            entregaBox.addEventListener('click', () => {
              entregaBox.classList.toggle('expanded');
              if (entregaBox.classList.contains('expanded')) {
                truncateText.textContent = reserva.entregue; // Restaura o texto completo
              } else {
                if (!supportsLineClamp) {
                  truncateText.textContent = originalText.slice(0, maxLength) + '...'; // Trunca novamente
                }
              }
            });
          }
        });
      });

      // Adiciona o event listener ao botão de exclusão
      const btnDelete = row.querySelector('.btn-delete');
      btnDelete.addEventListener('click', async () => {
        // Confirmação antes de deletar
        Swal.fire({
          title: 'Tem certeza?',
          text: "Você NÃO poderá reverter isso!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim, deletar!',
          cancelButtonText: 'Cancelar',
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Deleta a reserva do Firestore
              await deleteDoc(doc(db, "historico", reserva.id));
              Swal.fire('Deletado!', 'A reserva foi deletada.', 'success');
              // Recarrega as reservas após a exclusão
              fetchReservas();
            } catch (error) {
              Swal.fire('Erro!', 'Não foi possível deletar a reserva.', 'error');
              console.error("Erro ao deletar reserva: ", error);
            }
          }
        });
      });
    });
  } catch (error) {
    console.error("Erro ao buscar as reservas:", error);
  } finally {
    // Esconde o spinner, independentemente de sucesso ou erro
    document.getElementById("loading-overlay").style.display = "none";
  }
}

// Função para deletar todas as reservas do mês atual
async function deletarReservasDoMes() {
  const historicoCollection = collection(db, "historico");
  const historicoSnapshot = await getDocs(historicoCollection);

  // Filtra as reservas que possuem a coluna "entregue" OU o status "cancelado"
  const reservasList = historicoSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() })) // Inclui o ID do documento
    .filter(reserva => reserva.entregue || reserva.status === "cancelado"); // Inclui reservas canceladas

  // Filtra as reservas pelo mês selecionado
  const reservasFiltradas = filtrarReservasPorMes(reservasList, mesAtualIndex);

  // Confirmação antes de deletar
  Swal.fire({
    title: 'Tem certeza?',
    text: `Você está prestes a deletar todas as reservas de ${meses[mesAtualIndex]}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, deletar!',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Deleta cada reserva do mês
        for (const reserva of reservasFiltradas) {
          await deleteDoc(doc(db, "historico", reserva.id));
        }
        Swal.fire('Deletado!', `Todas as reservas de ${meses[mesAtualIndex]} foram deletadas.`, 'success');
        // Recarrega as reservas após a exclusão
        fetchReservas();
      } catch (error) {
        Swal.fire('Erro!', 'Não foi possível deletar as reservas.', 'error');
        console.error("Erro ao deletar reservas: ", error);
      }
    }
  });
}

// Função para gerar o PDF com as reservas do mês
async function gerarPDFMensal() {
  const { jsPDF } = window.jspdf; // Importa o jsPDF
  const doc = new jsPDF();

  // Função para converter imagem em base64
  function getBase64Image(imgUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Permite carregar imagens de diferentes origens
      img.src = imgUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };

      img.onerror = error => reject(error);
    });
  }

  // Caminho da imagem no seu computador (substitua pelo caminho correto)
  const imgUrl = './img/senac-logo.png';

  // Converte a imagem para base64 e adiciona ao PDF
  try {
    const base64Image = await getBase64Image(imgUrl);
    doc.addImage(base64Image, 'PNG', 170, 10, 30, 20); // Ajuste as coordenadas e o tamanho conforme necessário
  } catch (error) {
    console.error('Erro ao carregar a imagem:', error);
  }

  // Título do PDF
  doc.setFontSize(18);
  doc.text(`Histórico de Reserva de ${meses[mesAtualIndex]}`, 10, 10);


  // Busca as reservas do mês atual
  const historicoCollection = collection(db, "historico");
  const historicoSnapshot = await getDocs(historicoCollection);

  // Filtra as reservas que possuem a coluna "entregue" OU o status "cancelado"
  const reservasList = historicoSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() })) // Inclui o ID do documento
    .filter(reserva => reserva.entregue || reserva.status === "cancelado"); // Inclui reservas canceladas

  // Filtra as reservas pelo mês selecionado
  const reservasFiltradas = filtrarReservasPorMes(reservasList, mesAtualIndex);

  // Quantidade de reservas no mês
  const quantidadeReservas = reservasFiltradas.length;

  // Professor que mais fez reservas
  const professores = {};
  reservasFiltradas.forEach(reserva => {
    if (professores[reserva.nome]) {
      professores[reserva.nome]++;
    } else {
      professores[reserva.nome] = 1;
    }
  });
  const professorMaisReservas = Object.keys(professores).reduce((a, b) => professores[a] > professores[b] ? a : b);

  // Turma que mais fez reservas
  const turmas = {};
  reservasFiltradas.forEach(reserva => {
    if (turmas[reserva.turma]) {
      turmas[reserva.turma]++;
    } else {
      turmas[reserva.turma] = 1;
    }
  });
  const turmaMaisReservas = Object.keys(turmas).reduce((a, b) => turmas[a] > turmas[b] ? a : b);

  // Reservas onde os notebooks não foram entregues corretamente
  const reservasComErro = reservasFiltradas.filter(reserva => {
    return reserva.entregue !== "Todos os Notebooks Foram Entregues" && reserva.entregue !== "Reserva cancelada";
  });


  // Adiciona os dados ao PDF
  doc.setFontSize(12);
  doc.text(`Quantidade de reservas no mês: ${quantidadeReservas}`, 10, 20);
  doc.text(`Professor que mais fez reservas: ${professorMaisReservas}`, 10, 30);
  doc.text(`Turma que mais fez reservas: ${turmaMaisReservas}`, 10, 40);

// Cabeçalho da tabela no PDF
const headers = [["Nome", "Data", "Horário", "Quantidade", "Status", "Entregue"]];
const data = reservasFiltradas.map(reserva => {
  let dataFormatada = reserva.data;

  // Se a data for um timestamp do Firebase, converter para Date
  if (dataFormatada && dataFormatada.seconds) {
    dataFormatada = new Date(dataFormatada.seconds * 1000);
  } else if (typeof dataFormatada === "string") {
    dataFormatada = new Date(dataFormatada); // Converte string ISO para Date
  }

  // Formata para DD/MM/AAAA
  const dataFinal = dataFormatada
    ? dataFormatada.toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "Data inválida";

  // Determina o valor da coluna "Entregue"
  let entregueStatus;
  if (reserva.entregue === "Todos os Notebooks Foram Entregues") {
    entregueStatus = "Entregues";
  } else if (reserva.entregue === "Reserva cancelada") {
    entregueStatus = "Cancelada";
  } else {
    entregueStatus = "Os notebooks não foram entregues corretamente";
  }

  return [
    reserva.nome,
    dataFinal,
    `${reserva.horaInicio} - ${reserva.horaFim}`,
    reserva.quantidade,
    reserva.status || "N/A",
    entregueStatus
  ];
  
});

// Adiciona a tabela ao PDF usando o plugin autoTable
doc.autoTable({
  head: headers,
  body: data,
  startY: 50, // Posição inicial da tabela (abaixo dos dados adicionados)
  theme: "grid", // Estilo da tabela
  styles: { fontSize: 10 }, // Tamanho da fonte
  headStyles: { fillColor: [22, 160, 133] } // Cor do cabeçalho
});

// Salva o PDF
doc.save(`historico_reservas_${ meses[mesAtualIndex]}.pdf`);
}

// Adiciona o event listener ao botão "Gerar PDF Mensal"
document.getElementById('gerar-pdf').addEventListener('click', gerarPDFMensal);

// Event listeners para os botões de navegação do carrossel
document.getElementById('btn-anterior').addEventListener('click', () => {
  mesAtualIndex = (mesAtualIndex - 1 + 12) % 12; // Volta para o mês anterior
  atualizarMesCarrossel();
});

document.getElementById('btn-proximo').addEventListener('click', () => {
  mesAtualIndex = (mesAtualIndex + 1) % 12; // Avança para o próximo mês
  atualizarMesCarrossel();
});

// Adiciona o event listener ao botão "Deletar Histórico Mensal"
document.querySelector('.DivButton .buttonInferior:first-child').addEventListener('click', deletarReservasDoMes);

// Inicializa o carrossel e carrega as reservas
atualizarMesCarrossel();

// Carrega os dados do usuário ao iniciar a página
loadUserData();