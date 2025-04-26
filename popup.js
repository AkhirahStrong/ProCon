chrome.storage.local.get("email", (res) => {
  const status = document.getElementById("statusMessage");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!res.email) {
    status.textContent = "🔒 You're not logged in. Redirecting...";
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 1000);
    return;
  }

  status.textContent = `✅ Logged in as: ${res.email}`;
  logoutBtn.style.display = "inline-block";

  // ✅ Dynamically load limits.js
  const script = document.createElement("script");
  script.src = "limits.js";
  document.body.appendChild(script);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  chrome.storage.local.remove("email", () => {
    alert("👋 Logged out.");
    window.location.href = "auth.html";
  });
});


  
  