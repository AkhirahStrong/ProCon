importScripts('limits.js');

const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// On install - Create Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "ProCon",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "viewHistory",
    title: "View History",
    contexts: ["action"]
  });
});


// Call Backend API
async function callChatGPT(text, lang) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ selectedText: text, lang })
  });

  const data = await res.json();

  if (res.status === 429) {
    alert(data.error || "🚫 IP daily limit reached.");
    throw new Error("IP limit reached");
  }

  if (!res.ok) {
    alert(data.error || "❌ Something went wrong.");
    throw new Error("Unknown error");
  }

  return data.summary;
}


// Context Menu Handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

  if (info.menuItemId === "analyzePrivacy") {

    // 1. Local Limit Check
    const localAllowed = await checkLocalLimit();

    if (!localAllowed) {
      alert("🚫 Daily limit reached on this browser.\nSign up for unlimited access.");
      chrome.tabs.create({ url: 'https://your-site.com/signup' });
      return;
    }

    const selectedText = info.selectionText;

    // 2. Show Loading Alert
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        alert(`⏳ Analyzing:\n\n"${text}"`);
      },
      args: [selectedText]
    });

    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");

    try {
      // 3. Backend Call with IP Check
      const result = await callChatGPT(selectedText, lang);

      // 4. Save Result to History
      const timestamp = new Date().toISOString();
      const siteName = new URL(tab.url).hostname;
      const newEntry = { summary: result, timestamp, bookmarked: false, site: siteName };

      chrome.storage.local.get({ history: [] }, (data) => {
        const updated = [...data.history, newEntry];
        chrome.storage.local.set({ history: updated });
      });

      // 5. Open Summary Page
      chrome.tabs.create({
        url: chrome.runtime.getURL(`summary.html?summary=${encodeURIComponent(result)}`)
      });

    } catch (err) {
      console.warn("Analysis failed:", err);
      // Don't break flow - Alert already shown
    }

  }


  if (info.menuItemId === "viewHistory") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("history.html")
    });
  }

});
