import { initializeApp } from "./lib/firebase-app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "./lib/firebase-auth";


// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
    authDomain: "procon-extension.firebaseapp.com",
    projectId: "procon-extension",
    storageBucket: "procon-extension.appspot.com",
    messagingSenderId: "137078467459",
    appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign Up with Google
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signupWithGoogleBtn").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      chrome.storage.local.set({ email }, () => {
        console.log("✅ Google email saved:", email);
        window.location.href = "popup.html"; // Or thank you page
      });

    } catch (error) {
      console.error("❌ Google signup failed:", error);
      document.getElementById("statusMessage").textContent = "Signup failed. Please try again.";
    }
  });

  // Sign Up with Email + Password
  document.getElementById("signupWithEmailBtn").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    const statusMessage = document.getElementById("statusMessage");

    if (!email || !password) {
      statusMessage.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      chrome.storage.local.set({ email: result.user.email }, () => {
        console.log("✅ Email signup saved:", result.user.email);
        window.location.href = "popup.html"; // Or thank you page
      });

    } catch (error) {
      console.error("❌ Email signup failed:", error.message);
      statusMessage.textContent = error.message || "Signup failed.";
    }
  });
});
  