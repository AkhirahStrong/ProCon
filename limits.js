// limits.js

// const LOCAL_LIMIT = 1; 
// const IP_LIMIT = 10;   

// Track Local Usage Limit
async function checkLocalLimit() {
  try {
    const isPro = await checkIfProUser();
    if (isPro) return true; // Unlimited for Pro users

    const today = new Date().toDateString();

    return new Promise((resolve) => {
      chrome.storage.local.get(["usageCount", "usageDate", "email"], (data) => {
        try {
          let { usageCount = 0, usageDate = today, email } = data;

          // Reset count if it's a new day
          if (usageDate !== today) {
            usageCount = 0;
            usageDate = today;
          }

          // Set limits based on user type
          let allowedLimit = 3; // Default: guest
          if (email && email.includes("@")) {
            allowedLimit = 5; // Signed up free user
          }

          console.log(`📅 Today is: ${today}`);
          console.log(`📈 Usage count: ${usageCount}/${allowedLimit}`);

          if (usageCount >= allowedLimit) {
            resolve(false); // Limit reached
          } else {
            chrome.storage.local.set({ usageCount: usageCount + 1, usageDate });
            resolve(true); // Still allowed
          }
        } catch (storageError) {
          console.error("❌ Storage access error:", storageError);
          resolve(false); // Safely assume limit reached if storage fails
        }
      });
    });

  } catch (err) {
    console.error("❌ checkLocalLimit failed:", err);
    return false; // Safely deny access if something critical fails
  }
}


async function checkIfProUser() {
  try {
    const { email } = await chrome.storage.local.get("email");

    if (!email) {
      console.warn("⚠️ No email found. Treating as GUEST user.");
      return false; // GUEST users handled by local limit (3 free)
    }

    const res = await fetch("https://procon-backend.onrender.com/check-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }) // send email for Pro check
    });

    const body = await res.json();
    console.log("🔍 checkIfProUser response:", body);

    return body.isPro === true;
  } catch (err) {
    console.error("Check Pro error:", err);
    return false;
  }
}



