const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// This runs when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "ProCon",
    contexts: ["selection"]
  });
});

// API call to your backend
async function callChatGPT(text) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ selectedText: text })
  });

  const data = await res.json();
  return data.summary;
}

// When a context menu item is clicked
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    alert("⏳ Analyzing... Please wait a moment.");

    const selectedText = info.selectionText;
    const result = await callChatGPT(selectedText);

    chrome.tabs.create({
      url: chrome.runtime.getURL(`summary.html?summary=${encodeURIComponent(result)}`)
    });
  }
});
