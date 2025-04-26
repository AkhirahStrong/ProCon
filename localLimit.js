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

  document.getElementById("signUpBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openSignupPage" });
  });

 

  document.getElementById("waitBtn").addEventListener("click", () => {
    window.close();
  });
});
