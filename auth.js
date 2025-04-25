// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
    authDomain: "procon-extension.firebaseapp.com",
    projectId: "procon-extension",
    storageBucket: "procon-extension.firebasestorage.app",
    messagingSenderId: "137078467459",
    appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  async function authenticateUser(isSignUp) {
    const provider = new firebase.auth.GoogleAuthProvider();
  
    try {
      const result = await auth.signInWithPopup(provider);
      const email = result.user.email;
      const isNewUser = result.additionalUserInfo.isNewUser;
  
      chrome.storage.local.set({ email }, () => {
        const status = document.getElementById("authStatus");
        status.textContent = isSignUp
          ? (isNewUser ? `🎉 Welcome, ${email}!` : `⚠️ Already signed up. Logging in...`)
          : `✅ Logged in as ${email}`;
  
        setTimeout(() => window.close(), 2000);
      });
    } catch (err) {
      console.error("❌ Auth failed:", err);
      document.getElementById("authStatus").textContent = "❌ Authentication failed.";
    }
  }
  
  document.getElementById("signupBtn").addEventListener("click", () => authenticateUser(true));
  document.getElementById("loginBtn").addEventListener("click", () => authenticateUser(false));
  