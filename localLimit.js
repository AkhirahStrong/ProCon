window.handleUpgrade = function () {
  window.open('https://buy.stripe.com/test_5kA18195J10kdr28ww', '_blank');
};
  
  function handleLogin() {
    window.open('https://your-site.com/login', '_blank');
  }
  
  function handleWait() {
    window.close();  // Closes tab
  }

  window.addEventListener('DOMContentLoaded', () => {
    console.log("Limit Modal Loaded");
  });

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 1000); // 1 second delay
  });
  
  