// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLcUaI74zPK9TP9pV-pYY15CbtoiwCsXg",
  authDomain: "baby-name-picker-fe571.firebaseapp.com",
  databaseurl: "https://console.firebase.google.com/u/0/project/baby-name-picker-fe571/database/baby-name-picker-fe571-default-rtdb/data/~2F?utm_source=chatgpt.com",
  projectId: "baby-name-picker-fe571",
  storageBucket: "baby-name-picker-fe571.firebasestorage.app",
  messagingSenderId: "714898625809",
  appId: "1:714898625809:web:fa46a611966a0ef1c368b0"
};

firebase.initializeApp(firebaseConfig);

const database =
    firebase.database();

window.database = database;
