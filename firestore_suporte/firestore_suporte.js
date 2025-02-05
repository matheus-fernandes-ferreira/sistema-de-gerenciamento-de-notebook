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