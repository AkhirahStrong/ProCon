importScripts('limits.js');

const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// On install
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

// Context menu handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText?.trim();

    if (!selectedText) {
      console.warn("⚠️ No text selected.");
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("⚠️ Please select text first."),
      });
      return;
    }

    // Check local limit first
    const localAllowed = await checkLocalLimit();
    if (!localAllowed) {
      chrome.tabs.create({ url: chrome.runtime.getURL('localLimit.html') });
      return;
    }

    // Show "Analyzing" popup
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText],
    });

    // Get email
    chrome.storage.local.get(["email", "lang"], async (result) => {
      const email = result.email;
      const lang = result.lang || "en";

      if (!email) {
        console.warn("⚠️ No email found, user may need to sign up/login first.");
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => alert("⚠️ Please sign up or log in first."),
        });
        return;
      }

      try {
        const summary = await callChatGPT(selectedText, lang, email);

        // Save summary to history
        const timestamp = new Date().toISOString();
        const siteName = new URL(tab.url).hostname;
        const newEntry = { summary, timestamp, bookmarked: false, site: siteName };

        chrome.storage.local.get({ history: [] }, (data) => {
          const updated = [...data.history, newEntry];
          chrome.storage.local.set({ history: updated });
        });

        await chrome.storage.local.set({ latestSummary: summary });

        chrome.tabs.create({ url: chrome.runtime.getURL("summary.html") });

      } catch (err) {
        console.error("Analysis failed:", err.message);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (errorMessage) => alert(errorMessage),
          args: [err.message],
        });
      }
    });
  }

  if (info.menuItemId === "viewHistory") {
    chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
  }
});

// Backend Call
async function callChatGPT(text, lang, email) {
  console.log("📡 Sending to backend:", BACKEND_URL);
  console.log("✉️ Email:", email);
  console.log("📝 Selected text:", text);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedText: text, lang, email }),
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

// ✅ Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSignupPage") {
    chrome.tabs.create({ url: chrome.runtime.getURL("signup.html") });
  }
  if (message.action === "openUpgradePage") {
    chrome.tabs.create({ url: "https://your-stripe-payment-link.com" });
  }
});
