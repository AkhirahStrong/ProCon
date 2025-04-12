// limits.js

const LOCAL_LIMIT = 10; // per browser
const IP_LIMIT = 10;   // per IP per day

// Track Local Usage Limit
async function checkLocalLimit() {
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

