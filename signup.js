// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
    authDomain: "procon-extension.firebaseapp.com",
    projectId: "procon-extension",
    storageBucket: "procon-extension.appspot.com",
    messagingSenderId: "137078467459",
    appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
  };
  
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("signupWithGoogleBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    chrome.storage.local.set({ email }, () => {
      console.log("✅ Google email saved:", email);
      window.location.href = "popup.html"; // Or success page
    });

  } catch (error) {
    console.error("❌ Google signup failed:", error);
    document.getElementById("statusMessage").textContent = "Signup failed. Please try again.";
  }
});
  