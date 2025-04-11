const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// This runs when the extension is installed
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

// API call to your backend
async function callChatGPT(text, lang) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ selectedText: text, lang  })
  });

  const data = await res.json();
  return data.summary;
}

// When a context menu item is clicked
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    // ✅ Show alert on the current page with highlighted text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        alert(`⏳ Analyzing:\n\n"${text}"`);
      },
      args: [selectedText]
    });

    // 🔹 Call your backend
    // const result = await callChatGPT(selectedText);
    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");
    const result = await callChatGPT(selectedText, lang);


    // ✅ Save to history
    const timestamp = new Date().toISOString();
    const siteName = new URL(tab.url).hostname;  // grabs domain only
    const newEntry = { summary: result, timestamp, bookmarked: false, site: siteName };

    

    chrome.storage.local.get({ history: [] }, (data) => {
      const updated = [...data.history, newEntry];
      chrome.storage.local.set({ history: updated });
    });

    // 🔹 Open summary page with result
    chrome.tabs.create({
      url: chrome.runtime.getURL(`summary.html?summary=${encodeURIComponent(result)}`)
    });

  }
  // Optional: if you add a second context menu for history
if (info.menuItemId === "viewHistory") {
  chrome.tabs.create({
    url: chrome.runtime.getURL("history.html")
  });

}
});
