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

// Context Menu Handler
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

    // 1. Check local usage limit first
    const localAllowed = await checkLocalLimit();
    if (!localAllowed) {
      chrome.tabs.create({ url: chrome.runtime.getURL('localLimit.html') });
      return;
    }

    // 2. Show "Analyzing" popup
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(`⏳ Analyzing:\n\n"${text}"`),
      args: [selectedText],
    });

    // 3. Check if user is guest or signed-in
    chrome.storage.local.get(["email", "lang", "guestUsageCount"], async (result) => {
      const email = result.email;
      const lang = result.lang || "en";

      if (!email) {
        // Guest Mode
        const guestUsage = result.guestUsageCount || 0;

        if (guestUsage >= 3) {
          console.warn("🚫 Guest limit reached. Forcing signup...");
          chrome.tabs.create({ url: chrome.runtime.getURL('signup.html') });
          return;
        }

        // Allow guest usage
        chrome.storage.local.set({ guestUsageCount: guestUsage + 1 });

        try {
          const summary = await callChatGPT(selectedText, lang, "guest@example.com");
          await saveSummary(summary, tab.url);
        } catch (err) {
          console.error("Guest analysis failed:", err.message);
        }

        return;
      }

      // Logged-in user
      try {
        const summary = await callChatGPT(selectedText, lang, email);
        await saveSummary(summary, tab.url);
      } catch (err) {
        console.error("Logged-in analysis failed:", err.message);
      }
    });
  }

  if (info.menuItemId === "viewHistory") {
    chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
  }
});

// Call Backend API
async function callChatGPT(text, lang, email) {
  console.log("📡 Sending to backend:", BACKEND_URL);
  console.log("✉️ Email:", email);
  console.log("📝 Selected text:", text);

  if (!text || !email) {
    throw new Error("Missing selectedText or email");
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

// Save to history helper
async function saveSummary(summary, siteUrl) {
  const timestamp = new Date().toISOString();
  const siteName = new URL(siteUrl).hostname;
  const newEntry = { summary, timestamp, bookmarked: false, site: siteName };

  chrome.storage.local.get({ history: [] }, (data) => {
    const updated = [...data.history, newEntry];
    chrome.storage.local.set({ history: updated });
  });

  await chrome.storage.local.set({ latestSummary: summary });

  chrome.tabs.create({ url: chrome.runtime.getURL("summary.html") });
}

// ✅ Background message listeners (signup/upgrade buttons)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSignupPage") {
    chrome.tabs.create({ url: chrome.runtime.getURL("signup.html") });
  }
  if (message.action === "openUpgradePage") {
    chrome.tabs.create({ url: "https://your-stripe-payment-link.com" });
  }
});
