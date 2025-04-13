function handleUpgrade() {
    window.open('https://your-site.com/upgrade', '_blank');
  }
  
  function handleLogin() {
    window.open('https://your-site.com/login', '_blank');
  }
  
  function handleWait() {
    window.close();  // Closes tab
  }

  window.addEventListener('DOMContentLoaded', () => {
    console.log("Limit Modal Loaded");
  });
  