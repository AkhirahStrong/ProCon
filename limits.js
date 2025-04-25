// limits.js

const LOCAL_LIMIT = 15; // per browser
const IP_LIMIT = 10;   // per IP per day

// Track Local Usage Limit
async function checkLocalLimit() {

  const isPro = await checkIfProUser();
  if (isPro) return true;

  return new Promise((resolve) => {
    chrome.storage.local.get(["usageCount", "usageDate"], (data) => {
      const today = new Date().toDateString();
      let { usageCount = 0, usageDate = today } = data;

      if (usageDate !== today) {
        usageCount = 0;
        usageDate = today;
      }

      if (usageCount >= LOCAL_LIMIT) {
        resolve(false); // limit hit
      } else {
        chrome.storage.local.set({ usageCount: usageCount + 1, usageDate });
        resolve(true); // still good
      }
    });
  });
}

async function checkIfProUser() {
  try {
    const { email } = await chrome.storage.local.get("email");

    // if (!email) {
    //   console.warn("No email found in storage.");
    //   return false;
    // }

    if (!email) {
      console.warn("⚠️ No email found. Prompt user to log in.");
      // Optional: Open login page automatically
      chrome.runtime.openOptionsPage?.(); // or manually open login.html
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


