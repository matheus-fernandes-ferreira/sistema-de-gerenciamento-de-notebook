import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Função para carregar os dados do usuário
document.addEventListener("DOMContentLoaded", () => {
  const nomeInput = document.getElementById("nome");
  const matriculaInput = document.getElementById("matricula");
  const turmaInput = document.getElementById("turma");
  const dataInput = document.getElementById("data");
  const horaInicioInput = document.getElementById("horaInicio");
  const horaFimInput = document.getElementById("horaFim");
  const quantidadeInput = document.getElementById("quantidade");
  const reservarBtn = document.getElementById("reservar");
  const statusMsg = document.getElementById("status");

  // Função para carregar os dados do usuário
  async function loadUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const matricula = urlParams.get("matricula");

    // if (!matricula) {
    //   alert("Matrícula não encontrada.");
    //   return;
    // }



    try {
      const q = query(
        collection(db, "sistema-note"),
        where("matricula", "==", matricula)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        // Exibe os dados na página
        nomeInput.textContent = userData.nome;
        matriculaInput.textContent = userData.matricula;
      } else {
        // alert("Usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao carregar os dados do usuário:", error);
      alert("Erro ao tentar carregar os dados do usuário.");
    }
  }

  async function carregarNote() {
    let quantidade = 0; // Contador de notebooks selecionados
    const notebooksContainer = document.getElementById("notestatus"); // Elemento onde os notebooks serão inseridos
    const quantidadeElement = document.getElementById("quantidade"); // Elemento que exibe a quantidade

    try {
      // Criando uma query ordenada pelo campo 'inventario' em ordem crescente
      const q = query(collection(db, "Notebooks"), orderBy("inventario", "asc"));
      const querySnapshot = await getDocs(q); // Executa a consulta

      notebooksContainer.innerHTML = ""; // Limpa o conteúdo antes de adicionar os novos elementos

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const inventario = data.inventario || "Sem inventário"; // Pega o campo 'inventario'
        const notebookStatus = data.status_notebook; // Pega o campo 'notebook_status'

        // Criando o HTML dinamicamente
        const label = document.createElement("label");
        label.innerHTML = `
                <input class="radio-input" type="checkbox" name="notebook" ${notebookStatus ? '' : 'disabled'}>
                <span class="radio-tile">
                    <span class="radio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path d="M128 32C92.7 32 64 60.7 64 96l0 256 64 0 0-256 384 0 0 256 64 0 0-256c0-35.3-28.7-64-64-64L128 32zM19.2 384C8.6 384 0 392.6 0 403.2C0 445.6 34.4 480 76.8 480l486.4 0c42.4 0 76.8-34.4 76.8-76.8c0-10.6-8.6-19.2-19.2-19.2L19.2 384z"/>
                        </svg>
                    </span>
                    <span class="radio-label">${inventario}</span>
                </span>
            `;

        // Altera a cor do ícone se o notebook estiver inativo (status false)
        const radioIcon = label.querySelector(".radio-icon svg");
        if (!notebookStatus) {
          radioIcon.style.fill = "#8493B3"; // Cor para quando o status for false
        }

        // Adiciona o label ao container
        notebooksContainer.appendChild(label);

        // Pegando o checkbox dentro do label
        const input = label.querySelector("input");

        // Se o notebook estiver habilitado (status true), adiciona o evento de contagem
        if (notebookStatus) {
          input.addEventListener("change", function () {
            if (input.checked) {
              quantidade++; // Incrementa a quantidade se o checkbox for selecionado
            } else {
              quantidade--; // Decrementa se o checkbox for desmarcado
            }
            quantidadeElement.textContent = quantidade; // Atualiza o número exibido em "Quantidade"
          });
        }
      });

    } catch (error) {
      console.error("Erro ao buscar os notebooks:", error);
    }
  }

  // Chama a função para carregar os notebooks
  carregarNote();

  // Chama a função para carregar os dados ao carregar a página
  loadUserData();

  reservarBtn.addEventListener("click", async () => {
    const nome = nomeInput.textContent.trim();
    const matricula = matriculaInput.textContent.trim();
    const turma = turmaInput.value;
    const data = dataInput.value;
    const horaInicio = horaInicioInput.value;
    const horaFim = horaFimInput.value;
    const quantidade = quantidadeInput.textContent.trim();


    if (!nome || !matricula || !turma || !data || !horaInicio || !horaFim || !quantidade) {
      statusMsg.textContent = "Preencha todos os campos!";
      statusMsg.style.color = "red";
      return;
    }

    try {
      await addDoc(collection(db, "reserva"), {
        nome: nome,
        matricula: matricula,
        turma: turma,
        data: data,
        horaInicio: horaInicio,
        horaFim: horaFim,
        quantidade: quantidade,
        criadoEm: new Date().toISOString()
      });

      statusMsg.textContent = "Reserva salva com sucesso!";
      statusMsg.style.color = "green";

      // Limpar apenas os campos de entrada
      turmaInput.value = "";
      dataInput.value = "";
      horaInicioInput.value = "";
      horaFimInput.value = "";
      quantidadeInput.textContent = "";  // Atualize o campo de quantidade para exibir corretamente
    } catch (error) {
      console.error("Erro ao salvar reserva: ", error);
      statusMsg.textContent = "Erro ao salvar!";
      statusMsg.style.color = "red";
    }
  });

});