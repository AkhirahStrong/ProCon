// No imports here because firebaseBundle is already globally loaded

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
  authDomain: "procon-extension.firebaseapp.com",
  projectId: "procon-extension",
  storageBucket: "procon-extension.appspot.com",
  messagingSenderId: "137078467459",
  appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
};

// Initialize Firebase app using bundled firebaseBundle
const app = firebaseBundle.initializeApp(firebaseConfig);
const auth = firebaseBundle.getAuth(app);

// Set up event listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {

  // Google Sign Up / Login
  document.getElementById("signupWithGoogleBtn").addEventListener("click", async () => {
    const provider = new firebaseBundle.GoogleAuthProvider();

    try {
      const result = await firebaseBundle.signInWithPopup(auth, provider);
      const email = result.user.email;

      chrome.storage.local.set({ email }, () => {
        console.log("✅ Google email saved:", email);
        window.location.href = "popup.html"; // Redirect after success
      });

    } catch (error) {
      console.error("❌ Google signup failed:", error);
      document.getElementById("statusMessage").textContent = "Signup failed. Please try again.";
    }
  });

  // Email and Password Sign Up
  document.getElementById("signupWithEmailBtn").addEventListener("click", async () => {
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    const statusMessage = document.getElementById("statusMessage");

    if (!email || !password) {
      statusMessage.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const result = await firebaseBundle.createUserWithEmailAndPassword(auth, email, password);

      chrome.storage.local.set({ email: result.user.email }, () => {
        console.log("✅ Email signup saved:", result.user.email);
        window.location.href = "popup.html"; // Redirect after success
      });

    } catch (error) {
      console.error("❌ Email signup failed:", error.message);
      statusMessage.textContent = error.message || "Signup failed.";
    }
  });

});
