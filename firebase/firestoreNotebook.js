import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Função para adicionar um novo notebook
async function addNotebook(inventario) {
  try {
    // Verifica se o número de inventário já existe
    const q = query(collection(db, 'Notebooks'), where('inventario', '==', parseInt(inventario)));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      Swal.fire('Erro', 'Número de inventário já existe!', 'error');
      return;
    }

    const docRef = await addDoc(collection(db, 'Notebooks'), {
      inventario: parseInt(inventario),
      status_notebook: true // Por padrão, o notebook está disponível
    });
    console.log("Notebook adicionado com ID: ", docRef.id);
    loadNotebooks(); // Recarrega a lista de notebooks
  } catch (error) {
    console.error("Erro ao adicionar notebook: ", error);
  }
}

// Função para exibir o alerta e adicionar o notebook
document.getElementById('btn-adicionar').addEventListener('click', () => {
  Swal.fire({
    title: '<i class="fas fa-laptop" style="color: #afafaf; font-size: 55px; margin-top:20px; margin-bottom:20px;"></i> <br> Adicionar Notebook',
    html: `
      <input type="number" id="inventario" class="swal2-input custom-input" placeholder="Número de Inventário">
    `,
    focusConfirm: false,
    showCloseButton: true,
    customClass: {
      popup: "custom-swal-container",
      title: "custom-swal-title",
      icon: 'icon-swal',
      confirmButton: 'confirm-swal-button',
    },
    preConfirm: () => {
      const inventario = Swal.getPopup().querySelector('#inventario').value;
      if (!inventario) {
        Swal.showValidationMessage('Por favor, insira o número de inventário');
      }
      return { inventario: inventario };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      addNotebook(result.value.inventario);
    }
  });
});


// Função para carregar os notebooks na tabela
// Função para carregar os notebooks na tabela
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

async function loadNotebooks() {
  const notebooksBody = document.getElementById('reservas-body');
  notebooksBody.innerHTML = ''; // Limpa a tabela antes de carregar os dados

  try {
    // Mostra o overlay e o spinner
    document.getElementById("loading-overlay").style.display = "block";

    const querySnapshot = await getDocs(collection(db, 'Notebooks'));
    const notebooks = [];

    // Armazena os notebooks em um array
    querySnapshot.forEach((doc) => {
      notebooks.push({ id: doc.id, ...doc.data() });
    });

    // Ordena os notebooks pelo número de inventário (ordem crescente)
    notebooks.sort((a, b) => a.inventario - b.inventario);

    // Preenche a tabela com os notebooks ordenados
    notebooks.forEach((notebook) => {
      const statusSVG = notebook.status_notebook
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="green"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="red"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

      const row = `
        <tr>
          <td>${notebook.inventario}</td>
          <td>
            ${statusSVG}
            ${notebook.status_notebook ? 'Disponível' : 'Indisponível'}
          </td>
          <td>
            <button class="btn-details edit-btn" data-id="${notebook.id}" data-inventario="${notebook.inventario}" data-status="${notebook.status_notebook}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"  width="35" height="20" fill='white'><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"/></svg>
            </button>
            </td>
            <td>
            <button class="btn-details delete-btn" data-id="${notebook.id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="35" height="20" fill='white'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>
            </button>
          </td>
        </tr>
      `;
      notebooksBody.insertAdjacentHTML('beforeend', row);
    });

    // Adiciona o evento de clique para os botões de deletar
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const notebookId = button.getAttribute('data-id');

        // Exibe um alerta de confirmação
        Swal.fire({
          title: 'Tem certeza?',
          text: 'Você realmente deseja excluir este notebook?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim, excluir!',
          cancelButtonText: 'Cancelar',
          customClass: {
            popup: "custom-swal-container",  // Define tamanho do container
            title: "custom-swal-title",      // Estiliza o título
            htmlContainer: "custom-swal-text", // Estiliza o texto
            icon: 'icon-swal',
            confirmButton: 'confirm-swal-button',
            cancelButton: 'cancel-swal-button',
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await deleteDoc(doc(db, 'Notebooks', notebookId));
              Swal.fire({
                title: "Excluído!",
                icon: "success",
                text: "O notebook foi excluído com sucesso.",
                customClass: {
                  popup: "custom-swal-container",  // Define tamanho do container
                  title: "custom-swal-title",      // Estiliza o título
                  htmlContainer: "custom-swal-text", // Estiliza o texto
                  icon: 'icon-swal',
                  confirmButton: 'confirm-swal-button',
                }
              });

              loadNotebooks(); // Recarrega a lista de notebooks após deletar
            } catch (error) {
              console.error('Erro ao deletar notebook:', error);
              Swal.fire('Erro', 'Não foi possível excluir o notebook.', 'error');
            }
          }
        });
      });
    });

    // Adiciona o evento de clique para os botões de edição
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const notebookId = button.getAttribute('data-id');
        const inventario = button.getAttribute('data-inventario');
        const currentStatus = button.getAttribute('data-status') === 'true';

        // Exibe o alerta de edição
        Swal.fire({
          icon: "question",
          title: `Editando Notebook ${inventario}`,
          html: `
            <p>Deseja marcar esse notebook como ${currentStatus ? 'indisponível' : 'disponível'}?</p>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
          customClass: {
            popup: "custom-swal-container",  // Define tamanho do container
            title: "custom-swal-title",      // Estiliza o título
            htmlContainer: "custom-swal-text", // Estiliza o texto
            icon: 'icon-swal',
            confirmButton: 'confirm-swal-button',
            cancelButton: 'cancel-swal-button',
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await updateDoc(doc(db, 'Notebooks', notebookId), {
                status_notebook: !currentStatus
              });
              Swal.fire('Sucesso!', `O notebook foi marcado como ${currentStatus ? 'indisponível' : 'disponível'}.`, 'success');
              loadNotebooks(); // Recarrega a lista de notebooks após editar
            } catch (error) {
              console.error('Erro ao atualizar notebook:', error);
              Swal.fire('Erro', 'Não foi possível atualizar o status do notebook.', 'error');
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Erro ao carregar notebooks:', error);
  } finally {
    // Esconde o overlay e o spinner
    document.getElementById("loading-overlay").style.display = "none";
  }
}

// Carrega os dados do usuário ao carregar a página
document.addEventListener("DOMContentLoaded", loadUserData);

// Carrega os notebooks quando a página é carregada
window.addEventListener('load', loadNotebooks);