// logout.js

// ✅ Use firebaseBundle because we're in IIFE bundled mode
const auth = firebaseBundle.getAuth(firebaseBundle.getApp());

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await firebaseBundle.signOut(auth);
      console.log("✅ Successfully signed out.");

      // Optional: clear local storage email after signout
      chrome.storage.local.remove(["email"], () => {
        console.log("✅ Cleared stored email after logout.");
      });

      // ✅ Redirect to a friendly logout page
      window.location.href = chrome.runtime.getURL("logoutSuccess.html");
    } catch (err) {
      console.error("❌ Error during signout:", err);
    }
  });
});
