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

// debugging reptil request
console.log("Sending to backend:", BACKEND_URL);
console.log("Selected text:", text);


try{


  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ selectedText: text, lang })
  });

  // Debugging: What does the raw response object look like?
  console.log("Raw response:", res);

  const data = await res.json();

  if (res.status === 429) {
    // IP Limit Hit
    throw new Error(data.error || "🚫 IP daily limit reached.");
  }

  if (!res.ok) {
    throw new Error(data.error || "❌ Something went wrong.");
  }

  return data.summary;
  
}catch (fetchError) {
  console.error("Fetch error:", fetchError);
}
}


// Context Menu Handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    if (!selectedText) {
      console.warn("No text selected.");
      return;
    }

    // 1. Local Limit Check
    const localAllowed = await checkLocalLimit();

    if (!localAllowed) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("🚫 Daily limit reached on this browser.\nSign up for unlimited access."),
      });

      chrome.tabs.create({ url: 'https://your-site.com/signup' });
      return;
    }

    // 2. Show "Analyzing" Alert
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText]
    });

    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");

    try {
      // 3. Backend Call with IP Limit Check
      const result = await callChatGPT(selectedText, lang);

      // 4. Save to History
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
      console.warn("Analysis failed:", err.message);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (errorMessage) => alert(errorMessage),
        args: [err.message]
      });
    }

  }

  if (info.menuItemId === "viewHistory") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("history.html")
    });
  }

});
