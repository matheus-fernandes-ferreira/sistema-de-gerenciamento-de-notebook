import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
    import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

        if (!matricula) {
          alert("Matrícula não encontrada.");
          return;
        }

        

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
            alert("Usuário não encontrado.");
          }
        } catch (error) {
          console.error("Erro ao carregar os dados do usuário:", error);
          alert("Erro ao tentar carregar os dados do usuário.");
        }
      }

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