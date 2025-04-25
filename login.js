// ✅ Firebase v8 style (no import)
const firebaseConfig = {
  apiKey: "AIzaSyDQ-XebQsAjLqV3Ti3pGfE1iOqz8r2VA0cgit",
  authDomain: "procon-extension.firebaseapp.com",
  projectId: "procon-extension",
  storageBucket: "procon-extension.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const email = result.user.email;

    chrome.storage.local.set({ email }, () => {
      console.log("✅ Logged in as:", email);

      // Confirm it's really stored
    chrome.storage.local.get("email", (res) => {
    console.log("📦 Confirmed stored email:", res.email);
  });

      document.getElementById("loginStatus").textContent = `✅ Logged in as ${email}`;
      setTimeout(() => window.close(), 2000);
    });
  } catch (err) {
    console.error("❌ Login failed:", err);
    document.getElementById("loginStatus").textContent = "❌ Login failed.";
  }
});
