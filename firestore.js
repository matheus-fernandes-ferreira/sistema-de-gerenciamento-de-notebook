 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
        import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
    
        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDiFzkz8fypa5R29cdNvIDGyBMTGD9mfs8",
            authDomain: "sistema-de-notebooks.firebaseapp.com",
            projectId: "sistema-de-notebooks",
            storageBucket: "sistema-de-notebooks.firebasestorage.app",
            messagingSenderId: "80287744691",
            appId: "1:80287744691:web:53b1056f5530a3d695a6c6",
            measurementId: "G-0T0Q5SB2C7"
        };
    
        // Inicializa o Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
    
        // Função de login
        async function login() {
            const matricula = document.getElementById("username").value;
            const senha = document.getElementById("senha").value;
    
            if (!matricula || !senha) {
                alert("Preencha todos os campos!");
                return;
            }
    
            try {
                const colaboradoresRef = collection(db, "sistema-note");
                const q = query(colaboradoresRef, where("matricula", "==", matricula), where("senha", "==", senha));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    alert("Login bem-sucedido!");
                    window.location.href = "outra_pagina.html"; // Redireciona para outra página
                } else {
                    alert("Matrícula ou senha incorreta.");
                }
            } catch (error) {
                console.error("Erro ao fazer login:", error);
                alert("Erro ao tentar login. Tente novamente.");
            }
        }
    
        // Adiciona evento ao botão de login
        document.querySelector(".botao-acessar").addEventListener("click", login);