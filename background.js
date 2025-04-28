// ✅ Import limits helper
importScripts('limits.js');

// ✅ Backend URL
const BACKEND_URL = "https://procon-backend.onrender.com/analyze";

// ✅ Helper: Call your backend AI service
async function callChatGPT(text, lang) {
  const userData = await chrome.storage.local.get(["email", "lang"]);
  const email = userData.email || "guest@procon.com"; // 🛠 Fallback to guest email if missing

  console.log("📡 Sending to backend:", BACKEND_URL);
  console.log("✉️ Email:", email);
  console.log("📝 Selected text:", text);

  if (!text || !email) {
    throw new Error("Missing selectedText or email — cannot continue.");
  }

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedText: text, lang, email })
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

// ✅ Context menu creation when extension is installed
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

// ✅ Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    if (!selectedText) {
      alert("⚠️ No text selected to analyze.");
      return;
    }

    // 1. Check local usage limit
    const localAllowed = await checkLocalLimit();
    console.log("🧪 localAllowed result:", localAllowed);

    if (!localAllowed) {
      console.warn("🚫 Local limit reached.");

      // 🛠 Mini confirm popup before opening anything
      const userChoice = confirm(
        "🚫 You've reached your free limit.\n\nSign up for free to unlock 5 daily uses?\n\nPress OK to Sign Up, or Cancel to see options."
      );

      if (userChoice) {
        // ✅ Open signup page if user agrees
        chrome.tabs.create({
          url: chrome.runtime.getURL("signup.html")
        });
      } else {
        // ❌ Otherwise, show full limit options
        chrome.tabs.create({
          url: chrome.runtime.getURL("localLimit.html")
        });
      }
      return; // 🛑 Stop further execution
    }

    // 2. Tell user analysis is starting
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText]
    });

    const lang = await chrome.storage.local.get("lang").then(res => res.lang || "en");

    try {
      // 3. Call backend AI to analyze
      const result = await callChatGPT(selectedText, lang);

      // 4. Save analysis to history
      const timestamp = new Date().toISOString();
      const siteName = new URL(tab.url).hostname;
      const newEntry = { summary: result, timestamp, bookmarked: false, site: siteName };

      chrome.storage.local.get({ history: [] }, (data) => {
        const updatedHistory = [...data.history, newEntry];
        chrome.storage.local.set({ history: updatedHistory });
      });

      // 5. Open summary page
      await chrome.storage.local.set({ latestSummary: result });
      chrome.tabs.create({
        url: chrome.runtime.getURL("summary.html")
      });

    } catch (err) {
      console.warn("❌ Analysis failed:", err.message);

      // Show error nicely in current tab
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

// ✅ Listen for messages from localLimit.js buttons
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSignupPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("signup.html")
    });
  }

  if (message.action === "openUpgradePage") {
    chrome.tabs.create({
      url: "https://buy.stripe.com/dR629Zf9Wb1seXe6oo" // Replace with real Stripe checkout link!
    });
  }
});
