const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// This runs when extension is installed

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "Analyze with AI",
    contexts: ["selection"]
  });
});

// API call to your backend (Vercel)
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

// When user right-clicks selected text
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzePrivacy") {
    const selectedText = info.selectionText;

    // Call your API
    const result = await callChatGPT(selectedText);

    // Show the result as an alert on the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (output) => alert("Privacy Summary:\n\n" + output),
      args: [result]
    });
  }
});
