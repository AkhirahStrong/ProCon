import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// ✅ Firebase config (replace with your real values!)
const firebaseConfig = {
  apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
  authDomain: "procon-extension.firebaseapp.com",
  projectId: "procon-extension",
  storageBucket: "procon-extension.appspot.com",
  messagingSenderId: "137078467459",
  appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 login.js loaded");

  const loginBtn = document.getElementById("loginBtn");
  const loginStatus = document.getElementById("loginStatus");

  loginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // ✅ Save to Chrome Extension storage
      chrome.storage.local.set({ email }, () => {
        console.log("✅ Email stored:", email);
        loginStatus.textContent = `✅ Logged in as ${email}`;
        setTimeout(() => window.close(), 2000); // auto-close window
      });
    } catch (error) {
      console.error("❌ Login failed:", error);
      loginStatus.textContent = `❌ Login failed`;
    }
  });
});
