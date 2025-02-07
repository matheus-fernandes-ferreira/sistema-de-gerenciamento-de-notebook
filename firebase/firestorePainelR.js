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

// Função para buscar os colaboradores e montar os cards
async function carregarColaboradores() {
  try {
    const colRef = collection(db, "reserva");
    const querySnapshot = await getDocs(colRef);
    const container = document.getElementById("container");

    container.innerHTML = ""; // Limpa antes de adicionar novos elementos

    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
                            <button id="cancel" class="cancel" data-id="${doc.id}">
                                <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#ffffff" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
                                Cancelar
                            </button>
                            <button id="finish" class="finish">
                                <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ffffff" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            `;

      // Insere o card no container
      container.innerHTML += cardHTML;
    });

    // Adiciona eventos de clique nos botões "Cancelar"
    document.querySelectorAll(".cancel").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const reservaId = btn.getAttribute("data-id");

        Swal.fire({
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
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Deleta a reserva do Firestore
              await deleteDoc(doc(db, "reserva", reservaId));
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
              // Recarrega os colaboradores após o cancelamento
              carregarColaboradores();
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
        });
      });
    });

    document.querySelectorAll(".finish").forEach((btn) => {
      btn.addEventListener("click", () => {
        Swal.fire({
          title: "<strong>Check in</strong>",
          icon: "info",
          html: `
            <p style="color: red">
            Atenção! Se algum notebook estiver com algum problema que implique seu uso, comunique ao suporte <a style="color: red" href="#" <strong>clicando aqui.</strong></a></p>
          `,
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: `
            <i class="fa fa-thumbs-up"></i> Great!
          `,
          confirmButtonAriaLabel: "Thumbs up, great!",
          cancelButtonText: `
            <i class="fa fa-thumbs-down"></i>
          `,
          cancelButtonAriaLabel: "Thumbs down",
          customClass:{
            title: "custom-swal-check"
          }
        });
      });
    });

  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
  }
}

// Chama a função após o carregamento do DOM
window.addEventListener("DOMContentLoaded", carregarColaboradores);