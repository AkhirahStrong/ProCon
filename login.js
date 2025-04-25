// login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0cgit",
  authDomain: "procon-extension.firebaseapp.com",
  projectId: "procon-extension",
  storageBucket: "procon-extension.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // Save email for usage check
    chrome.storage.local.set({ email }, () => {
      console.log("✅ Logged in as:", email);
      document.getElementById("loginStatus").textContent = `✅ Logged in as ${email}`;
      setTimeout(() => window.close(), 2000); // Auto-close after short delay
    });

    chrome.storage.local.get("email", (result) => {
      console.log("📦 Email in storage:", result.email);
    });
    
  } catch (err) {
    console.error("❌ Login failed:", err);
    document.getElementById("loginStatus").textContent = "❌ Login failed.";
  }
});
