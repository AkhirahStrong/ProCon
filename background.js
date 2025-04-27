// background.js

// ✅ Import local limits
importScripts('limits.js');

// ✅ Your backend URL
const BACKEND_URL = "https://procon-backend.onrender.com/analyze";

// ✅ When extension is installed → create context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "ProCon Analyze Selection",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "viewHistory",
    title: "View History",
    contexts: ["action"]
  });
});

// ✅ Function to call backend to analyze selected text
async function callChatGPT(text, lang) {
  const userData = await chrome.storage.local.get(["email", "lang"]);
  const email = userData.email;

  console.log("📡 Sending to backend:", BACKEND_URL);
  console.log("✉️ Email:", email);
  console.log("📝 Selected text:", text);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ selectedText: text, lang, email }) // sending email too
    });

    const data = await res.json();

    if (res.status === 429) {
      throw new Error(data.error || "🚫 IP/email daily limit reached.");
    }

    if (!res.ok) {
      throw new Error(data.error || "❌ Something went wrong.");
    }

    return data.summary;
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    throw fetchError;
  }
}

// ✅ Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    if (!selectedText) {
      console.warn("⚠️ No text selected.");
      return;
    }

    // 1. Local Limit Check first
    const localAllowed = await checkLocalLimit();
    console.log("🧪 localAllowed result:", localAllowed);

    if (!localAllowed) {
      console.warn("🚫 Limit reached. Forcing signup...");
      // 🚪 Open signup.html if limit is hit
      chrome.tabs.create({
        url: chrome.runtime.getURL('signup.html')
      });
      return; // ⛔ Stop further analysis
    }

    // 2. Show "Analyzing" alert
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText]
    });

    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");

    try {
      // 3. Call backend
      const result = await callChatGPT(selectedText, lang);

      // 4. Save to History
      const timestamp = new Date().toISOString();
      const siteName = new URL(tab.url).hostname;
      const newEntry = { summary: result, timestamp, bookmarked: false, site: siteName };

      chrome.storage.local.get({ history: [] }, (data) => {
        const updated = [...data.history, newEntry];
        chrome.storage.local.set({ history: updated });
      });

      await chrome.storage.local.set({ latestSummary: result });

      // 5. Open summary.html to show result
      chrome.tabs.create({
        url: chrome.runtime.getURL("summary.html")
      });

    } catch (err) {
      console.warn("❌ Analysis failed:", err.message);

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

// ✅ Listen for custom messages (for signup/upgrade)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSignupPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("signup.html")
    });
  }

  if (message.action === "openUpgradePage") {
    chrome.tabs.create({
      url: "https://your-stripe-payment-link.com" // Replace with your Stripe link
    });
  }
});
