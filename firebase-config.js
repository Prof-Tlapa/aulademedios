// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsP0mFuWyJBnH2w1c_victOiZJo7hu-Ng",
  authDomain: "aulademedios-b5bb6.firebaseapp.com",
  projectId: "aulademedios-b5bb6",
  storageBucket: "aulademedios-b5bb6.firebasestorage.app",
  messagingSenderId: "993147947086",
  appId: "1:993147947086:web:d6a0a555db70791f501b1f",
  measurementId: "G-MDBTHJGKTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
