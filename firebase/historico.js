import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchReservas() {
  const reservasCollection = collection(db, "reserva");
  const reservasSnapshot = await getDocs(reservasCollection);

  // Filtra as reservas que possuem a coluna "entregue"
  const reservasList = reservasSnapshot.docs
    .map(doc => doc.data())
    .filter(reserva => reserva.entregue); // Filtra apenas as reservas com a coluna "entregue"

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
      <td>${reserva.horaInicio}-${reserva.horaFim}</td>
      <td>${reserva.quantidade}</td>
      <td><button class="btn-details"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="20" fill="white"><path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"/></svg></button></td>
    `;
    tableBody.appendChild(row);
  });
}

fetchReservas();