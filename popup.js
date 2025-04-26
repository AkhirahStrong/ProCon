// popup.js

chrome.storage.local.get("email", (res) => {
  const status = document.getElementById("statusMessage");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!res.email) {
    status.textContent = "🔒 You're not logged in. Redirecting...";
    setTimeout(() => {
      window.location.href = chrome.runtime.getURL("signup.html"); // ✅ Real login/signup page
    }, 1000);
    return;
  }

  status.textContent = `✅ Logged in as: ${res.email}`;
  logoutBtn.style.display = "inline-block";

  // ✅ Load limits.js only if logged in
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("limits.js");
  document.body.appendChild(script);
});

// ✅ Logout logic
document.getElementById("logoutBtn").addEventListener("click", () => {
  chrome.storage.local.remove("email", () => {
    // Smoothly go to signup page after logout
    window.location.href = chrome.runtime.getURL("signup.html");
  });
});



  
  