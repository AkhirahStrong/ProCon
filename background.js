// ✅ Import limits
importScripts('limits.js');

// ✅ Backend URL
const BACKEND_URL = "https://procon-backend.onrender.com/analyze";

// ✅ Helper: Call your backend AI service
async function callChatGPT(selectedText, lang) {
  const userData = await chrome.storage.local.get(["email", "lang"]);
  const email = userData.email; // Could be undefined for guest

  // Build body: Only include email if it exists
  const body = { selectedText, lang };
  if (email) {
    body.email = email;
  }

  console.log("📡 Sending to backend:", BACKEND_URL);
  console.log("✉️ Email:", email || "(Guest)");
  console.log("📝 Selected text:", selectedText);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.status === 429) {
      throw new Error(data.error || "🚫 IP/email daily limit reached.");
    }

    if (!res.ok) {
      throw new Error(data.error || "❌ Something went wrong.");
    }

    return data.summary;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err; // Let the caller handle the error
  }
}

// ✅ Context menu creation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "ProCon Analyze Selection",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "viewHistory",
    title: "View ProCon History",
    contexts: ["action"]
  });
});

// ✅ Handle context menu actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    if (!selectedText) {
      alert("⚠️ No text selected to analyze.");
      return;
    }

    // 1. Local usage limit check
    const localAllowed = await checkLocalLimit();
    console.log("🧪 localAllowed result:", localAllowed);

    if (!localAllowed) {
      // Redirect user to signup/upgrade
      chrome.tabs.create({
        url: chrome.runtime.getURL("signup.html")
      });
      return;
    }

    // 2. Notify user we're analyzing
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText]
    });

    // 3. Attempt to call backend
    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");

    try {
      const result = await callChatGPT(selectedText, lang);

      // 4. Save the result to Chrome Storage
      const timestamp = new Date().toISOString();
      const siteName = new URL(tab.url).hostname;
      const newEntry = { summary: result, timestamp, bookmarked: false, site: siteName };

      chrome.storage.local.get({ history: [] }, (data) => {
        const updatedHistory = [...data.history, newEntry];
        chrome.storage.local.set({ history: updatedHistory });
      });

      // 5. Open summary.html page to show result
      await chrome.storage.local.set({ latestSummary: result });
      chrome.tabs.create({
        url: chrome.runtime.getURL("summary.html")
      });

    } catch (err) {
      console.warn("❌ Analysis failed:", err.message);

      // Show user-friendly error alert
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

// ✅ Listen to special extension messages (open signup/upgrade page)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSignupPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("signup.html")
    });
  }

  if (message.action === "openUpgradePage") {
    chrome.tabs.create({
      url: "https://your-stripe-payment-link.com" // Replace with real Stripe checkout link
    });
  }
});
