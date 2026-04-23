// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyABCDEFghijklmnopqrstuvwxyz12345",  // TU API KEY
  authDomain: "agenda-escolar.firebaseapp.com",      // TU DOMINIO
  projectId: "agenda-escolar",                        // TU PROYECTO
  storageBucket: "agenda-escolar.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
