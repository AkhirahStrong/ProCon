// limits.js

const LOCAL_LIMIT = 1; // per browser
const IP_LIMIT = 10;   // per IP per day

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
          if (email) {
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
      console.warn("⚠️ No email found. Prompt user to log in.");
      // Optional: Open login page automatically
      // chrome.runtime.openOptionsPage?.(); // or manually open login.html
      return false;
    }

    const res = await fetch("https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/check-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })  // send email for Pro check
    });

    const body = await res.json();
    console.log("🔍 checkIfProUser response:", body);

    return body.isPro === true;
  } catch (err) {
    console.error("Check Pro error:", err);
    return false;
  }
}


