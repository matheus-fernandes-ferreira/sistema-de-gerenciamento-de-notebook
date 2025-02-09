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
  function loadUserData() {
    const matricula = localStorage.getItem("matricula"); // **Pegar a matrícula do localStorage**

    if (!matricula) {
        alert('Você precisa fazer login primeiro.');
        window.location.href = "login.html"; // Redireciona para o login se não estiver autenticado
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
            } else {
                alert('Usuário não encontrado.');
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar dados do usuário:", error);
        });
}

// **Chamar loadUserData() ao carregar a página**
document.addEventListener("DOMContentLoaded", loadUserData);


  async function carregarNote() {
    let quantidade = 0;
    const notebooksContainer = document.getElementById("notestatus");
    const quantidadeElement = document.getElementById("quantidade");

    try {
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
    }
  }

  async function verificarConflitoReserva(data, horaInicio, horaFim, notebooksSelecionados) {
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

  // Chama a função para carregar os notebooks
  carregarNote();

  // Chama a função para carregar os dados ao carregar a página
  loadUserData();

  

    async function marcarNotebooksIndisponiveis() {
      const data = dataInput.value;
      const horaInicio = horaInicioInput.value;

      if (!data || !horaInicio) {
        return; // Não faz nada se a data ou hora não forem preenchidas
      }

      try {
        const q = query(
          collection(db, "reserva"),
          where("data", "==", data)
        );

        const querySnapshot = await getDocs(q);
        let notebooksIndisponiveis = [];

        querySnapshot.forEach((doc) => {
          const reserva = doc.data();
          const reservaInicio = reserva.horaInicio;
          const reservaFim = reserva.horaFim;

          // Verifica se há conflito de horário
          if (
            (horaInicio >= reservaInicio && horaInicio < reservaFim) ||
            (horaInicio <= reservaInicio && horaInicio >= reservaFim)
          ) {
            notebooksIndisponiveis.push(...reserva.notebooksSelecionados);
          }
        });

        // Atualiza a interface
        document.querySelectorAll('input[name="notebook"]').forEach(input => {
          const notebookLabel = input.parentElement.querySelector('.radio-label').textContent.trim();

          if (notebooksIndisponiveis.includes(notebookLabel)) {
            input.disabled = true; // Torna o notebook indisponível
            input.checked = false; // Caso estivesse selecionado, desmarca
            input.parentElement.querySelector('.radio-icon svg').style.fill = "#8493B3";
          } else {
            input.disabled = false; // Deixa disponível se não estiver reservado
            input.parentElement.querySelector('.radio-icon svg').style.fill = "#0A3174";
          }
        });

      } catch (error) {
        console.error("Erro ao buscar reservas:", error);
      }
    }
    dataInput.addEventListener("change", marcarNotebooksIndisponiveis);
    horaInicioInput.addEventListener("change", marcarNotebooksIndisponiveis);

    reservarBtn.addEventListener("click", async () => {
      const nome = nomeInput.textContent.trim();
      const matricula = matriculaInput.textContent.trim();
      const turma = turmaInput.value;
      const data = dataInput.value;
      const horaInicio = horaInicioInput.value;
      const horaFim = horaFimInput.value;
      const quantidade = quantidadeInput.textContent.trim();

      // Captura os notebooks selecionados
      const notebooksSelecionados = Array.from(document.querySelectorAll('input[name="notebook"]:checked'))
        .map(input => input.parentElement.querySelector('.radio-label').textContent.trim());

      if (!nome || !matricula || !turma || !data || !horaInicio || !horaFim || !quantidade || notebooksSelecionados.length === 0) {
        statusMsg.textContent = "Preencha todos os campos e selecione pelo menos um notebook!";
        statusMsg.style.color = "red";
        return;
      }

      // Verifica se há conflitos antes de criar a reserva
      const { conflito, mensagem } = await verificarConflitoReserva(data, horaInicio, horaFim, notebooksSelecionados);

      if (conflito) {
        statusMsg.textContent = mensagem || "Já existe uma reserva nesse horário para um ou mais notebooks selecionados. Escolha outro horário!";
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
          quantidade: notebooksSelecionados.length, // Usa o número de notebooks selecionados
          notebooksSelecionados: notebooksSelecionados, // Adiciona os notebooks selecionados
          criadoEm: new Date().toISOString()
        });

        statusMsg.textContent = "Reserva salva com sucesso!";
        statusMsg.style.color = "green";

        // Limpar apenas os campos de entrada
        turmaInput.value = "";
        dataInput.value = "";
        horaInicioInput.value = "";
        horaFimInput.value = "";
        quantidadeInput.textContent = "";
        document.querySelectorAll('input[name="notebook"]:checked').forEach(input => input.checked = false);
      } catch (error) {
        console.error("Erro ao salvar reserva: ", error);
        statusMsg.textContent = "Erro ao salvar!";
        statusMsg.style.color = "red";
      }
    });
  });

  // Obtém o elemento onde a data será exibida
  const dataElemento = document.querySelector("#maindireita p");

  // Cria uma nova instância de Date para obter a data e hora atuais
  const dataAtual = new Date();

  // Formata a data e hora no formato desejado (ex: 28/01/2025 14:30)
  const dataFormatada = dataAtual.toLocaleString("pt-BR", {
    year: 'numeric',
    month: 'long', // Mês completo (ex: janeiro)
    day: 'numeric',
  });

  // Adiciona a data formatada ao parágrafo
  dataElemento.innerHTML = `Notebooks Disponíveis dia ${dataFormatada} .`;