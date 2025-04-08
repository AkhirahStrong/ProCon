document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("history");
  
    // ✅ Safety check: Make sure this was opened through the extension
    if (!chrome?.storage?.local) {
      container.innerText = "❌ Please open this page through the Chrome extension.";
      return;
    }
  
    // ✅ Otherwise, load the saved history
    chrome.storage.local.get({ history: [] }, (data) => {
      if (data.history.length === 0) {
        container.innerHTML = "<p>No history yet.</p>";
        return;
      }
  
      container.innerHTML = data.history.reverse().map(entry => `
        <div class="entry" style="background:#fff;padding:1rem;margin-bottom:1rem;border-radius:8px;box-shadow:0 0 4px rgba(0,0,0,0.1);">
          <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <pre>${entry.summary}</pre>
        </div>
      `).join("");
    });
  });
  
  