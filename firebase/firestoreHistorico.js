import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Função para buscar as reservas do histórico
async function fetchReservas() {
  const historicoCollection = collection(db, "historico");
  const historicoSnapshot = await getDocs(historicoCollection);

  // Filtra as reservas que possuem a coluna "entregue" OU o status "cancelado"
  const reservasList = historicoSnapshot.docs
    .map(doc => doc.data())
    .filter(reserva => reserva.entregue || reserva.status === "cancelado"); // Inclui reservas canceladas

  const tableBody = document.getElementById('reservas-body');
  tableBody.innerHTML = ''; // Limpa o conteúdo atual

  reservasList.forEach(reserva => {
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
      <td><button class="btn-details">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="35" height="20" ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#c9c9c9" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
      </button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Chama a função para carregar as reservas ao carregar a página
fetchReservas();