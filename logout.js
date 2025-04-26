// logout.js

// ✅ Initialize auth from bundled firebase
const auth = firebaseBundle.getAuth(firebaseBundle.getApp());

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutBtn");

  logoutButton.addEventListener("click", async () => {
    try {
      await firebaseBundle.signOut(auth);
      console.log("✅ Successfully signed out.");

      // Clear local stored email (optional but good)
      chrome.storage.local.remove(["email"], () => {
        console.log("✅ Cleared stored email after logout.");
      });

      // ✅ Redirect to logout success page
      window.location.href = chrome.runtime.getURL("logoutSuccess.html");

    } catch (err) {
      console.error("❌ Error during signout:", err);
      alert("Logout failed. Please try again.");
    }
  });
});
