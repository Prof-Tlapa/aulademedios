// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyB3o9vWk1xJQ5L8mNp2R7tUyV3wX4zA6bC8dE9fG",
    authDomain: "aulademedios.firebaseapp.com",
    projectId: "aulademedios",
    storageBucket: "aulademedios.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase conectado correctamente");
console.log("📁 Base de datos lista:", db);
