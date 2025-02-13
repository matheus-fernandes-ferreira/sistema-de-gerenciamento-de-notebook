import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Lista de meses
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julio", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Índice do mês atual
let mesAtualIndex = new Date().getMonth(); // Mês atual (0-11)

// Função para atualizar o mês exibido no carrossel
function atualizarMesCarrossel() {
  document.getElementById('mes-atual').textContent = meses[mesAtualIndex];
  fetchReservas(); // Atualiza a tabela com as reservas do mês selecionado
}

// Função para filtrar as reservas pelo mês selecionado
function filtrarReservasPorMes(reservas, mesIndex) {
  return reservas.filter(reserva => {
    const dataReserva = reserva.data?.seconds ? new Date(reserva.data.seconds * 1000) : new Date(reserva.data);
    return dataReserva.getMonth() === mesIndex;
  });
}

// Função para buscar as reservas do histórico
async function fetchReservas() {
  const historicoCollection = collection(db, "historico");
  const historicoSnapshot = await getDocs(historicoCollection);

  // Filtra as reservas que possuem a coluna "entregue" OU o status "cancelado"
  const reservasList = historicoSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() })) // Inclui o ID do documento
    .filter(reserva => reserva.entregue || reserva.status === "cancelado"); // Inclui reservas canceladas

  // Filtra as reservas pelo mês selecionado
  const reservasFiltradas = filtrarReservasPorMes(reservasList, mesAtualIndex);

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
          <p><strong>Nome:</strong> ${reserva.nome}</p>
          <p><strong>Matrícula:</strong> ${reserva.matricula}</p>
          <p><strong>Turma:</strong> ${reserva.turma}</p>
          <p><strong>Data:</strong> ${dataFinal}</p>
          <p><strong>Horário:</strong> ${reserva.horaInicio} - ${reserva.horaFim}</p>
          <p><strong>Quantidade:</strong> ${reserva.quantidade}</p>
          <p><strong>Status:</strong> ${reserva.status}</p>
          <p><strong>Entrega:</strong> ${reserva.entregue}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#3085d6',
      });
    });

    // Adiciona o event listener ao botão de exclusão
    const btnDelete = row.querySelector('.btn-delete');
    btnDelete.addEventListener('click', async () => {
      // Confirmação antes de deletar
      Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter isso!",
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