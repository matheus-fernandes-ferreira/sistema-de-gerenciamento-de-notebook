import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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


// Função para buscar os colaboradores e montar os cards
async function carregarColaboradores() {
    try {
        // Referência à coleção "colaborador" (verifique o nome da sua coleção)
        const colRef = collection(db, "reserva");
        const querySnapshot = await getDocs(colRef);

        // Seleciona o container onde os cards serão inseridos
        const container = document.getElementById("container");

        // Itera sobre cada documento da coleção
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Cria o HTML do card utilizando os dados retornados
            const cardHTML = `
          <div class="cardSeparator">
            <div class="leftCard">
              <!-- Se houver uma imagem ou outra informação, insira aqui -->
            </div>
            <div class="bodyCard">
              <div class="colaborador">
                <figure>
                  <!-- Exemplo: se tiver uma URL de foto -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#454545" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
                </figure>
                <div><strong><u>${data.nome || 'Nome do Colaborador'}</u></strong></div>
              </div>
              <div class="infosreserva">
                <div class="data-hora">
                  <p class="textreserva">Data <br> <b>${data.data}</b></p>
                  <p class="textreserva">Horário <br> <b>${data.horaInicio} - ${data.horaFim}</b></p>
                </div>
                <p class="textreserva" id="notereserv">
                  ${data.notebooks ? data.notebooks + " Notebook(s) reservado(s)" : "Notebook reservado"}
                </p>
              </div>
              <div id="scrollreservas">
                
              </div>
              <div class="buttons">
                <button id="cancel">
                  <svg class="buttonicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#ffffff" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
                Cancelar
                </button>
                <button id="finish">
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
    } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
    }
}

// Chama a função após o carregamento do DOM
window.addEventListener("DOMContentLoaded", carregarColaboradores);