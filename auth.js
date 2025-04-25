// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0c",
    authDomain: "procon-extension.firebaseapp.com",
    projectId: "procon-extension",
    storageBucket: "procon-extension.appspot.com",
    messagingSenderId: "137078467459",
    appId: "1:137078467459:web:f81952fe2a8fe9a93624b6"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  // ✅ Unified Login/Signup Handler
  async function authenticateUser(isSignUp) {
    const provider = new firebase.auth.GoogleAuthProvider();
    const status = document.getElementById("authStatus");
  
    try {
      const result = await auth.signInWithPopup(provider);
      const email = result.user.email;
      const isNewUser = result.additionalUserInfo.isNewUser;
  
      chrome.storage.local.set({ email }, () => {
        if (isSignUp) {
          status.textContent = isNewUser
            ? `🎉 Welcome, ${email}!`
            : `⚠️ Account already exists. Logging in...`;
        } else {
          status.textContent = `✅ Logged in as ${email}`;
        }
  
        setTimeout(() => {
          // Redirect or close
          window.location.href = "popup.html";
        }, 2000);
      });
  
    } catch (error) {
      console.error("❌ Auth error:", error);
      status.textContent = "❌ Authentication failed.";
    }
  }
  
  // ✅ Connect buttons to handlers
  document.getElementById("signupBtn").addEventListener("click", () => authenticateUser(true));
  document.getElementById("loginBtn").addEventListener("click", () => authenticateUser(false));
  