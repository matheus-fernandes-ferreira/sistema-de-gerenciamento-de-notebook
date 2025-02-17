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
  const horarioSelect = document.getElementById("horario");
  const quantidadeInput = document.getElementById("quantidade");
  const reservarBtn = document.getElementById("reservar");
  const statusMsg = document.getElementById("status");

  // Variável global para armazenar a quantidade de notebooks selecionados
  let quantidade = 0;

  // Função para carregar os dados do usuário
  function loadUserData() {
    const notebookLink = document.getElementById("notebook-link");
    if (notebookLink) {
      notebookLink.style.display = "none";
    }

    const matricula = localStorage.getItem("matricula");

    if (!matricula) {
      alert('Você precisa fazer login primeiro.');
      window.location.href = "login.html";
      return;
    }

    const colaboradoresRef = collection(db, "colaboradores");
    const q = query(colaboradoresRef, where("matricula", "==", matricula));

    getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          document.getElementById("nome").textContent = userData.nome;
          document.getElementById("matricula").textContent = userData.matricula;

          if (userData.cargo === "coordenador" && notebookLink) {
            notebookLink.style.display = "flex";
          }
        } else {
          alert('Usuário não encontrado.');
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do usuário:", error);
      });
  }

  // Função de logoff
  function logoff() {
    // Remove a matrícula do localStorage
    localStorage.removeItem("matricula");

    // Redireciona o usuário para a página de login
    window.location.href = "login.html";
  }

  // Adiciona evento ao botão de logoff
  const logoffButton = document.getElementById("logoffButton");
  if (logoffButton) {
    logoffButton.addEventListener("click", logoff);
  } else {
    console.error("Botão de logoff não encontrado!");
  }

  // Carregar dados do usuário ao iniciar
  loadUserData();

  // Restante do seu código (carregar notebooks, reservar, etc.)
  carregarNote();
  // Função para carregar os notebooks
  async function carregarNote() {
    const notebooksContainer = document.getElementById("notestatus");
    const quantidadeElement = document.getElementById("quantidade");

    try {
      // Mostra o overlay e o spinner
      document.getElementById("loading-overlay").style.display = "block";

      const q = query(collection(db, "Notebooks"), orderBy("inventario", "asc"));
      const querySnapshot = await getDocs(q);

      notebooksContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const inventario = data.inventario || "Sem inventário";
        const notebookStatus = data.status_notebook;

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

        const radioIcon = label.querySelector(".radio-icon svg");
        if (!notebookStatus) {
          radioIcon.style.fill = "#8493B3";
        }

        notebooksContainer.appendChild(label);

        const input = label.querySelector("input");

        if (notebookStatus) {
          input.addEventListener("change", function () {
            if (input.checked) {
              quantidade++;
            } else {
              quantidade--;
            }
            quantidadeElement.textContent = quantidade;
          });
        }
      });

    } catch (error) {
      console.error("Erro ao buscar os notebooks:", error);
    } finally {
      // Esconde o overlay e o spinner
      document.getElementById("loading-overlay").style.display = "none";
    }
  }

  // Função para verificar conflitos de reserva
  async function verificarConflitoReserva(data, horarioSelecionado, notebooksSelecionados) {
    const [horaInicio, horaFim] = horarioSelecionado.split("-");

    const q = query(
      collection(db, "reserva"),
      where("data", "==", data)
    );

    const querySnapshot = await getDocs(q);

    let totalReservados = 0; // Contador de notebooks já reservados no mesmo horário

    for (const doc of querySnapshot.docs) {
      const reserva = doc.data();
      const reservaInicio = reserva.horaInicio;
      const reservaFim = reserva.horaFim;

      // Verifica se há conflito de horário
      if (
        (horaInicio >= reservaInicio && horaInicio < reservaFim) ||
        (horaFim > reservaInicio && horaFim <= reservaFim) ||
        (horaInicio <= reservaInicio && horaFim >= reservaFim)
      ) {
        // Soma a quantidade de notebooks já reservados nesse horário
        totalReservados += reserva.notebooksSelecionados.length;

        // Verifica se há conflito de notebooks específicos
        const reservaNotebooks = reserva.notebooksSelecionados || [];
        if (reservaNotebooks.some(notebook => notebooksSelecionados.includes(notebook))) {
          return { conflito: true, mensagem: "Um ou mais notebooks selecionados já estão reservados nesse horário." };
        }
      }
    }

    // Verifica se a quantidade total de notebooks reservados excede o limite (20)
    if (totalReservados + notebooksSelecionados.length > 20) {
      return { conflito: true, mensagem: "Limite de notebooks reservados excedido para esse horário." };
    }

    return { conflito: false };
  }

  // Função para marcar notebooks indisponíveis
  async function marcarNotebooksIndisponiveis() {
    const data = dataInput.value;
    const horarioSelecionado = document.getElementById("horario").value;
    const [horaInicio, horaFim] = horarioSelecionado.split("-");

    if (!data || !horarioSelecionado) {
      return; // Não faz nada se a data ou horário não forem preenchidos
    }

    try {
      // Busca todos os notebooks
      const notebooksQuery = query(collection(db, "Notebooks"));
      const notebooksSnapshot = await getDocs(notebooksQuery);

      // Busca as reservas para a data selecionada
      const reservasQuery = query(
        collection(db, "reserva"),
        where("data", "==", data)
      );
      const reservasSnapshot = await getDocs(reservasQuery);

      let notebooksIndisponiveis = [];

      // Verifica conflitos de horário nas reservas
      reservasSnapshot.forEach((doc) => {
        const reserva = doc.data();
        const reservaInicio = reserva.horaInicio;
        const reservaFim = reserva.horaFim;

        // Verifica se há conflito de horário
        if (
          (horaInicio >= reservaInicio && horaInicio < reservaFim) ||
          (horaFim > reservaInicio && horaFim <= reservaFim) ||
          (horaInicio <= reservaInicio && horaFim >= reservaFim)
        ) {
          notebooksIndisponiveis.push(...reserva.notebooksSelecionados);
        }
      });

      // Atualiza a interface
      document.querySelectorAll('input[name="notebook"]').forEach(input => {
        const notebookLabel = input.parentElement.querySelector('.radio-label').textContent.trim();

        // Verifica se o notebook está indisponível por conflito de horário ou status geral
        const notebookDoc = notebooksSnapshot.docs.find(doc => doc.data().inventario.toString() === notebookLabel);
        const notebookStatus = notebookDoc ? notebookDoc.data().status_notebook : false;

        if (notebooksIndisponiveis.includes(notebookLabel) || !notebookStatus) {
          input.disabled = true; // Torna o notebook indisponível
          input.checked = false; // Caso estivesse selecionado, desmarca
          input.parentElement.querySelector('.radio-icon svg').style.fill = "#8493B3";
        } else {
          input.disabled = false; // Deixa disponível se não estiver reservado e estiver ativo
        }
      });

    } catch (error) {
      console.error("Erro ao buscar reservas ou notebooks:", error);
    }
  }

  // Event listeners para atualizar notebooks indisponíveis
  dataInput.addEventListener("change", marcarNotebooksIndisponiveis);
  horarioSelect.addEventListener("change", marcarNotebooksIndisponiveis);

  // Evento de clique no botão de reserva
  reservarBtn.addEventListener("click", async () => {
    const nome = nomeInput.textContent.trim();
    const matricula = matriculaInput.textContent.trim();
    const turma = turmaInput.value;
    const data = dataInput.value;
    const horarioSelecionado = document.getElementById("horario").value;
    const [horaInicio, horaFim] = horarioSelecionado.split("-");

    // Captura os notebooks selecionados
    const notebooksSelecionados = Array.from(document.querySelectorAll('input[name="notebook"]:checked'))
      .map(input => input.parentElement.querySelector('.radio-label').textContent.trim());

    if (!nome || !matricula || !turma || !data || !horarioSelecionado || notebooksSelecionados.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Ocorreu um erro!",
        text: "Preencha todos os campos.",
        customClass: {
          popup: "custom-swal-container",  // Define tamanho do container
          title: "custom-swal-title",      // Estiliza o título
          htmlContainer: "custom-swal-text", // Estiliza o texto
          icon: 'icon-swal',
          confirmButton: 'confirm-swal-button',
        }
      });
      return;
    }

    // Verifica se há conflitos antes de criar a reserva
    const { conflito, mensagem } = await verificarConflitoReserva(data, horarioSelecionado, notebooksSelecionados);

    if (conflito) {
      Swal.fire({
        icon: "error",
        title: "Escolha outro horário!",
        text: mensagem,
        customClass: {
          popup: "custom-swal-container",  // Define tamanho do container
          title: "custom-swal-title",      // Estiliza o título
          htmlContainer: "custom-swal-text", // Estiliza o texto
          icon: 'icon-swal',
          confirmButton: 'confirm-swal-button',
        }
      });
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
        quantidade: notebooksSelecionados.length, // Usa o número de notebooks selecionados
        notebooksSelecionados: notebooksSelecionados, // Adiciona os notebooks selecionados
        criadoEm: new Date().toISOString()
      });

      Swal.fire({
        title: "Reserva realizada!",
        icon: "success",
        customClass: {
          popup: "custom-swal-container",  // Define tamanho do container
          title: "custom-swal-title",      // Estiliza o título
          htmlContainer: "custom-swal-text", // Estiliza o texto
          icon: 'icon-swal',
          confirmButton: 'confirm-swal-button',
        }
      });

      // Limpar apenas os campos de entrada
      turmaInput.value = "";
      dataInput.value = "";
      document.getElementById("horario").value = "";
      quantidadeInput.textContent = "0"; // Reinicia a exibição da quantidade
      document.querySelectorAll('input[name="notebook"]:checked').forEach(input => input.checked = false);

      // Reinicia a variável quantidade
      quantidade = 0;
    } catch (error) {
      console.error("Erro ao salvar reserva: ", error);
      statusMsg.textContent = "Erro ao salvar!";
      statusMsg.style.color = "red";
    }
  });

  // Carregar notebooks e dados do usuário ao iniciar
  carregarNote();
  loadUserData();
});

// Exibir data atual na interface
const dataElemento = document.querySelector("#maindireita p");
const dataAtual = new Date();
const dataFormatada = dataAtual.toLocaleString("pt-BR", {
  year: 'numeric',
  month: 'long', // Mês completo (ex: janeiro)
  day: 'numeric',
});
dataElemento.innerHTML = `Notebooks Disponíveis dia ${dataFormatada}.`;