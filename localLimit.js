document.addEventListener("DOMContentLoaded", () => {
  console.log("Limit Modal Loaded");

  // Animate load class
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 1000);

  // Bind button events
  document.getElementById("upgradeBtn").addEventListener("click", () => {
    window.open("https://buy.stripe.com/test_5kA18195J10kdr28ww", "_blank");
  });

  document.getElementById("loginBtn").addEventListener("click", () => {
    window.open("https://your-site.com/login", "_blank");
  });

  document.getElementById("waitBtn").addEventListener("click", () => {
    window.close();
  });

  
});
