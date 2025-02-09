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

// Função de login
function login() {
    const matricula = document.getElementById('username').value;
    const senha = document.getElementById('senha').value;

    if (!matricula || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const colaboradoresRef = collection(db, "colaboradores");
    const q = query(colaboradoresRef, where("matricula", "==", matricula), where("senha", "==", senha));

    getDocs(q)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                // Salvar apenas a matrícula no localStorage
                localStorage.setItem("matricula", matricula);

                alert(`Bem-vindo, ${userData.nome}!`);
                window.location.href = "home.html";
            } else {
                alert('Matrícula ou senha incorretas.');
            }
        })
        .catch((error) => {
            console.error("Erro ao fazer login:", error);
            alert('Erro ao fazer login. Tente novamente.');
        });
}

// Expõe a função login globalmente
window.login = login;

// Adiciona evento ao botão de login
document.getElementById("loginButton").addEventListener("click", login);