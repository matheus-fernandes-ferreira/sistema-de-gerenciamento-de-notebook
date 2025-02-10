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
  const reservasList = reservasSnapshot.docs.map(doc => doc.data());

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
      <td>${reserva.horaInicio}</td>
      <td>${reserva.quantidade}</td>
      <td><button class="btn-details"><img src="" alt="icone"></button></td>
    `;
    tableBody.appendChild(row);
  });
}

fetchReservas();
