import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiFzkz8fypa5R29cdNvIDGyBMTGD9mfs8",
  authDomain: "sistema-de-notebooks.firebaseapp.com",
  projectId: "sistema-de-notebooks",
  storageBucket: "sistema-de-notebooks.appspot.com",
  messagingSenderId: "80287744691",
  appId: "1:80287744691:web:53b1056f5530a3d695a6c6",
  measurementId: "G-0T0Q5SB2C7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatarData(dataString) {
  if (!dataString) return '';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

const matricula = localStorage.getItem("matricula");
if (!matricula) {
  alert("Você precisa fazer login primeiro.");
  window.location.href = "login.html";
}

// Função para buscar as reservas e montar os cards
async function carregarReservas() {
  try {
    const colRef = collection(db, "reserva");
    const querySnapshot = await getDocs(colRef);
    const container = document.getElementById("container");

    container.innerHTML = ""; // Limpa antes de adicionar novos elementos

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const reservaMatricula = data.matricula; // Supondo que a reserva tenha um campo "matricula"

      // Cria o card da reserva
      const cardHTML = `
        <div class="cardSeparator">
            <div class="leftCard"></div>
            <div class="bodyCard">
                <div class="colaborador">
                    <figure>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#454545" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
                    </figure>
                    <div><strong><u>${data.nome || 'Nome do Colaborador'}</u></strong></div>
                </div>
                <div class="infosreserva">
                    <div class="data-hora">
                        <p class="textreserva">Data <br> <b>${formatarData(data.data)}</b></p>
                        <p class="textreserva">Horário <br> <b>${data.horaInicio} - ${data.horaFim}</b></p>
                    </div>
                    <p class="textreserva" id="notereserv">
                        ${data.notebooksSelecionados ? data.notebooksSelecionados.length + " Notebook(s) reservado(s)" : "Notebook reservado"}
                    </p>
                </div>
                <div id="scrollreservas">
                    ${data.notebooksSelecionados ? data.notebooksSelecionados.map(notebook => `<p class='notebookItem'>${notebook}</p>`).join('') : ''}
                </div>
                <div class="buttons">
                    ${reservaMatricula === matricula ? `
                    <button id="cancel" class="cancel" data-id="${doc.id}">
                        <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#ffffff" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
                        Cancelar
                    </button>
                    <button id="finish" class="finish" data-id="${doc.id}">
                        <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ffffff" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                        Finalizar
                    </button>
                    ` : ""}
                </div>
            </div>
        </div>
      `;

      // Insere o card no container
      container.innerHTML += cardHTML;
    });

    configurarEventos();
  } catch (error) {
    console.error("Erro ao buscar as reservas:", error);
  }
}

// Função para configurar os eventos de cancelar e finalizar
function configurarEventos() {
  // Evento de cancelar
  const cancelButtons = document.querySelectorAll(".cancel");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const reservaId = event.target.getAttribute("data-id");
      cancelarReserva(reservaId);
    });
  });

  // Evento de finalizar
  const finishButtons = document.querySelectorAll(".finish");
  finishButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const reservaId = event.target.getAttribute("data-id");
      finalizarReserva(reservaId);
    });
  });
}

// Função para cancelar uma reserva
// Função para cancelar uma reserva
async function cancelarReserva(reservaId) {
  try {
    // Exibe a confirmação do cancelamento
    const result = await Swal.fire({
      title: "Certeza que deseja cancelar sua reserva?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      iconColor: "#F7941D",
      confirmButtonColor: "#F7941D",
      cancelButtonColor: "#004A8D",
      confirmButtonText: "Sim, cancelar!",
      cancelButtonText: "Não, voltar!",
      customClass: {
        popup: "custom-swal-container",  // Define tamanho do container
        title: "custom-swal-title",      // Estiliza o título
        htmlContainer: "custom-swal-text", // Estiliza o texto
        icon: 'icon-swal',
        confirmButton: 'confirm-swal-button',
        cancelButton: 'cancel-swal-button'
      }
    });

    // Se o usuário confirmar o cancelamento
    if (result.isConfirmed) {
      // Deleta a reserva do Firestore
      await deleteDoc(doc(db, "reserva", reservaId));

      // Exibe a confirmação do sucesso no cancelamento
      Swal.fire({
        title: "Reserva cancelada!",
        confirmButtonColor: "#F7941D",
        text: "Sua reserva foi cancelada com sucesso.",
        icon: "success",
        customClass: {
          popup: "custom-swal-container",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
          icon: 'icon-swal',
          confirmButton: 'confirm-swal-button',
          cancelButton: 'cancel-swal-button'
        }
      });

      // Recarrega as reservas após o cancelamento
      carregarReservas();
    }
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    Swal.fire({
      title: "Erro!",
      text: "Ocorreu um erro ao cancelar a reserva.",
      icon: "error",
      confirmButtonColor: "#F7941D",
    });
  }
}



// Função para finalizar uma reserva
function finalizarReserva(reservaId) {
  Swal.fire({
    title: "Check in",
    html: `
      <p class="swal-check">Confirme se todos os notebooks foram entregues.
      <input type="checkbox">
      </p>
      <span  class="swal-text">
        Atenção! Se algum notebook estiver com algum problema que implique seu uso, comunique ao suporte  
        <a href="#" class="swal-link">clicando aqui</a>.
      </span >
      <p class="swal-aviso">Após o uso dos notebooks, coloque-os no local apropriado para carregamento e no carrinho.</p>
    `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: `
      <i class="fa fa-thumbs-up"></i> Confirmar
    `,
    cancelButtonText: `
      <i class="fa fa-thumbs-down"></i> Cancelar
    `,
    customClass: {
      title: "swal-title",
      popup: "swal-popup",
      confirmButton: "swal-confirm",
      cancelButton: "swal-cancel",
      closeButton: "swal-close"
    }
  });
}

// Chama a função após o carregamento do DOM
window.addEventListener("DOMContentLoaded", carregarReservas);
