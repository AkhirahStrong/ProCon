import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// 🔐 Replace with your Firebase credentials
const firebaseConfig = {
    // public key
  apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
  authDomain: "procon-extension.firebaseapp.com",
  projectId: "procon-extension",
  storageBucket: "procon-extension.appspot.com",
  messagingSenderId: "137078467459",
  appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // ✅ Store email locally
    chrome.storage.local.set({ email }, () => {
      console.log("✅ Email stored:", email);

      // ✅ Show feedback message
      const status = document.getElementById("loginStatus");
      status.textContent = `✅ Logged in as ${email}`;

      // ✅ Optional: Close login page after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    });
  } catch (error) {
    console.error("❌ Login failed:", error);

    // Optional error feedback
    document.getElementById("loginStatus").textContent = "❌ Login failed. Try again.";
  }
});
