const BACKEND_URL = "https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/analyze";

// This runs when extension is installed

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzePrivacy",
    title: "ProCon",
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
      func: (output) => {
        const newTab = window.open();
        // newTab.document.write("<pre style='white-space: pre-wrap; font-family: sans-serif; padding: 1em;'>" + output + "</pre>");
        const html = `
        <html>
          <head>
            <title>Privacy Summary</title>
            <style>
              body {
                font-family: 'Segoe UI', sans-serif;
                padding: 2rem;
                line-height: 1.6;
                background: #f7f7f7;
                color: #222;
              }
              h1 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
              }
              h2 {
                margin-top: 2rem;
                color: #444;
              }
              ul {
                margin-left: 1.5rem;
              }
              li {
                margin-bottom: 0.5rem;
              }
              .section {
                margin-bottom: 1.5rem;
              }
            </style>
          </head>
          <body>
            <h1>🧠 Privacy Policy Breakdown</h1>
            <div id="content">Processing summary...</div>
  
            <script>
              const raw = ${JSON.stringify(output)};
              const lines = raw.split("\\n").filter(Boolean);
              const content = { pros: [], cons: [], redFlags: [] };
              let current = "";
  
              lines.forEach(line => {
                const lower = line.toLowerCase();
                if (lower.includes("pros")) current = "pros";
                else if (lower.includes("cons")) current = "cons";
                else if (lower.includes("red flag")) current = "redFlags";
                else if (line.startsWith("-") && current) content[current].push(line.slice(1).trim());
              });
  
              const buildSection = (title, items) => {
                if (!items.length) return "";
                return \`<div class="section"><h2>\${title}</h2><ul>\${items.map(i => \`<li>\${i}</li>\`).join("")}</ul></div>\`;
              };
  
              const resultHTML =
                buildSection("✅ Pros", content.pros) +
                buildSection("⚠️ Cons", content.cons) +
                buildSection("🚨 Red Flags", content.redFlags);
  
              document.getElementById("content").innerHTML = resultHTML || "<p>No structured output found.</p>";
            </script>
          </body>
        </html>
      `;
  
      newTab.document.write(html);
      newTab.document.close();
      },
      args: [result]
    });
  }
});
