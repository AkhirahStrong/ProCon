// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
    authDomain: "procon-extension.firebaseapp.com",
    projectId: "procon-extension",
    storageBucket: "procon-extension.appspot.com", // ✅ fixed typo here
    messagingSenderId: "137078467459",
    appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
  };
  
  // Initialize Firebase (V8 style)
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
  
        if (isSignUp) {
          status.textContent = isNewUser
            ? `🎉 Welcome, ${email}!`
            : `⚠️ Account already exists. Logging in...`;
        } else {
          status.textContent = `✅ Logged in as ${email}`;
        }
  
        // Redirect instead of just closing, or you can close after 3 sec
        setTimeout(() => {
          window.location.href = "popup.html"; // or history.html
        }, 2000);
      });
  
    } catch (err) {
      console.error("❌ Authentication failed:", err);
      document.getElementById("authStatus").textContent = "❌ Authentication failed. Please try again.";
    }
  }
  
  document.getElementById("signupBtn").addEventListener("click", () => authenticateUser(true));
  document.getElementById("loginBtn").addEventListener("click", () => authenticateUser(false));
  