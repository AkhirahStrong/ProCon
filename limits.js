// limits.js

const LOCAL_LIMIT = 1; // per browser
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
    const res = await fetch("https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/check-pro", {
      method: "GET"
    });

    const { isPro } = await res.json();

    console.log("🧠 Pro check result:", isPro); // Debug here to check for pro

    const body = await res.json();
    console.log("🔍 checkIfProUser response:", body);

    return isPro === true;
  } catch (err) {
    console.error("Check Pro error:", err);
    return false;
  }
}
