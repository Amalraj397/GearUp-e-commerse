// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6oCwWMMPVUy278R7RqtfyIDjdf9Lr2bQ",
  authDomain: "auth-gearup.firebaseapp.com",
  projectId: "auth-gearup",
  storageBucket: "auth-gearup.firebasestorage.app",
  messagingSenderId: "1035509266541",
  appId: "1:1035509266541:web:1de31eb39abebb79be2764",
  measurementId: "G-53V2KH708H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
