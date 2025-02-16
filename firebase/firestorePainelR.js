import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, updateDoc, serverTimestamp, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Função para buscar o cargo do usuário logado
async function getCargoUsuario(matricula) {
  try {
    const colaboradoresRef = collection(db, "colaboradores");
    const q = query(colaboradoresRef, where("matricula", "==", matricula));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      return userData.cargo; // Retorna o cargo do usuário
    } else {
      console.error("Usuário não encontrado no banco de dados.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar o cargo do usuário:", error);
    return null;
  }
}

// Função para carregar os dados do usuário e verificar o cargo
async function loadUserData() {
  const matricula = localStorage.getItem("matricula"); // Pega a matrícula do localStorage

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

// Função para buscar as reservas e montar os cards
async function carregarReservas() {
  try {
    // Mostra o overlay e o spinner
    document.getElementById("loading-overlay").style.display = "block";

    const colRef = collection(db, "reserva");
    const querySnapshot = await getDocs(colRef);
    const container = document.getElementById("container");

    // Busca o cargo do usuário logado
    const cargo = await getCargoUsuario(matricula);

    container.innerHTML = ""; // Limpa antes de adicionar novos elementos

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const reservaMatricula = data.matricula; // Supondo que a reserva tenha um campo "matricula"

      // Verifica se o usuário é o dono da reserva ou se é um coordenador
      const isOwner = reservaMatricula === matricula;
      const isCoordinator = cargo === "coordenador";

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
                    <p class="textreserva">Turma: <b> ${data.turma}</b> </p>
                    <p class="textreserva" id="notereserv">
                    ${data.notebooksSelecionados ? data.notebooksSelecionados.length + " Notebook(s) reservado(s)" : "Notebook reservado"}
                    </p>
                </div>
                <div id="scrollreservas">
                    ${data.notebooksSelecionados ? data.notebooksSelecionados.map(notebook => `<p class='notebookItem'>${notebook}</p>`).join('') : ''}
                 
                </div>
                <div class="buttons">
                    ${isOwner || isCoordinator ? `
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
  } finally {
    // Esconde o overlay e o spinner
    document.getElementById("loading-overlay").style.display = "none";
  }
}

// Restante do código (configurarEventos, cancelarReserva, finalizarReserva, etc.) permanece o mesmo

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
        popup: "custom-swal-container",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-text",
        icon: 'icon-swal',
        confirmButton: 'confirm-swal-button',
        cancelButton: 'cancel-swal-button'
      }
    });

    // Se o usuário confirmar o cancelamento
    if (result.isConfirmed) {
      const reservaRef = doc(db, "reserva", reservaId);
      const reservaSnapshot = await getDoc(reservaRef); // Usando getDoc para buscar o documento

      if (reservaSnapshot.exists()) {
        const dadosReserva = reservaSnapshot.data();

        // Adiciona a reserva à coleção 'historico' com o status "cancelado"
        await setDoc(doc(db, "historico", reservaId), {
          ...dadosReserva, // Copia todos os dados da reserva
          status: "cancelado", // Adiciona o status de cancelamento
          entregue: "Reserva cancelada", // Adiciona o campo "entregue" com o valor "Reserva cancelada"
          dataFinalizacao: serverTimestamp(), // Adiciona a data/hora do cancelamento
        });

        // Deleta a reserva da coleção original
        await deleteDoc(reservaRef);

        // Exibe a confirmação do sucesso no cancelamento
        Swal.fire({
          title: "Reserva cancelada!",
          text: "Sua reserva foi cancelada com sucesso.",
          icon: "success",
          confirmButtonColor: "#F7941D",
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
      } else {
        console.error("Reserva não encontrada.");
      }
    }
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    Swal.fire({
      title: "Erro!",
      text: "Ocorreu um erro ao cancelar a reserva.",
      icon: "error",
      confirmButtonColor: "#F7941D",
      customClass: {
        popup: "custom-swal-container",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-text",
        icon: 'icon-swal',
        confirmButton: 'confirm-swal-button',
        cancelButton: 'cancel-swal-button'
      }
    });
  }
}

// Função para finalizar uma reserva
async function finalizarReserva(reservaId) {
  const { value: formValues } = await Swal.fire({
    title: "Finalizar Reserva",
    html: `
      <p class="swal-check">Confirme se todos os notebooks foram entregues.</p>
      <div class="swal-radio-group">
        <label>
          <input type="radio" name="confirmacao" value="sim" checked> Sim
        </label>
        <label>
          <input type="radio" name="confirmacao" value="nao"> Não
        </label>
      </div>
      <div id="swal-textarea-container" style="display: none;">
        <textarea id="swal-textarea" placeholder="Descreva o problema..."></textarea>
      </div>
      <span class="swal-text">
        Atenção! Se algum notebook estiver com algum problema que implique seu uso, comunique ao suporte
        <a href="#" class="swal-link">clicando aqui</a>.
      </span>
      <p class="swal-aviso">Após o uso dos notebooks, coloque-os no local apropriado para carregamento e no carrinho.</p>
    `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: `<i class="fa fa-thumbs-up"></i> Confirmar`,
    cancelButtonText: `<i class="fa fa-thumbs-down"></i> Cancelar`,
    customClass: {
      title: "swal-title",
      popup: "swal-popup",
      confirmButton: "swal-confirm",
      cancelButton: "swal-cancel",
      closeButton: "swal-close"
    },
    didOpen: () => {
      // Adiciona eventos para mostrar/ocultar a caixa de texto
      const radioSim = Swal.getPopup().querySelector('input[value="sim"]');
      const radioNao = Swal.getPopup().querySelector('input[value="nao"]');
      const textareaContainer = Swal.getPopup().querySelector('#swal-textarea-container');

      function toggleTextarea() {
        textareaContainer.style.display = radioNao.checked ? 'block' : 'none';
      }

      radioSim.addEventListener('change', toggleTextarea);
      radioNao.addEventListener('change', toggleTextarea);
    },
    preConfirm: () => {
      const confirmacao = Swal.getPopup().querySelector('input[name="confirmacao"]:checked').value;
      const descricaoProblema = Swal.getPopup().querySelector('#swal-textarea')?.value;

      if (confirmacao === "nao" && !descricaoProblema) {
        Swal.showValidationMessage("Por favor, descreva o problema.");
        return false; // Impede a confirmação
      }

      return { confirmacao, descricaoProblema };
    }
  });

  if (formValues) {
    const { confirmacao, descricaoProblema } = formValues;

    try {
      // Referência ao documento da reserva
      const reservaRef = doc(db, "reserva", reservaId);
      const reservaSnapshot = await getDoc(reservaRef); // Usando getDoc em vez de getDocs

      if (reservaSnapshot.exists()) {
        const dadosReserva = reservaSnapshot.data();

        // Adiciona à coleção 'historico' antes de deletar
        await setDoc(doc(db, "historico", reservaId), {
          ...dadosReserva,
          status: "finalizado",
          entregue: confirmacao === "sim" ? "Todos os Notebooks Foram Entregues" : descricaoProblema,
          dataFinalizacao: serverTimestamp(),
        });

        // Remove a reserva da coleção original
        await deleteDoc(reservaRef);

        // Remove o card do HTML
        const card = document.querySelector(`.finish[data-id="${reservaId}"]`).closest('.cardSeparator');
        if (card) {
          card.remove();
        }

        // Exibe a confirmação de sucesso
        Swal.fire({
          title: "Reserva Finalizada!",
          text: "A reserva foi finalizada com sucesso.",
          icon: "success",
          confirmButtonColor: "#F7941D",
          customClass: {
            popup: "custom-swal-container",
            title: "custom-swal-title",
            htmlContainer: "custom-swal-text",
            icon: 'icon-swal',
            confirmButton: 'confirm-swal-button',
            cancelButton: 'cancel-swal-button'
          }
        });
      } else {
        console.error("Reserva não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao finalizar reserva:", error);
      Swal.fire({
        title: "Erro!",
        text: "Ocorreu um erro ao finalizar a reserva.",
        icon: "error",
        confirmButtonColor: "#F7941D",
        customClass: {
          popup: "custom-swal-container",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
          icon: 'icon-swal',
          confirmButton: 'confirm-swal-button',
          cancelButton: 'cancel-swal-button'
        }
      });
    }
  }
}

// Chama a função após o carregamento do DOM
window.addEventListener("DOMContentLoaded", () => {
  carregarReservas();
  loadUserData(); // Carrega os dados do usuário e verifica o cargo
});