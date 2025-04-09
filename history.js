window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("history");

  if (!chrome?.storage?.local) {
    container.innerText = "⚠️ This page must be opened through the extension.";
    return;
  }

  chrome.storage.local.get({ history: [] }, (data) => {
    if (data.history.length === 0) {
      container.innerHTML = "<p>No history yet.</p>";
      return;
    }

    container.innerHTML = data.history.reverse().map(entry => `
      <div class="entry">
        <div class="timestamp">🗓️ ${new Date(entry.timestamp).toLocaleString()}</div>
        <pre>${entry.summary}</pre>
      </div>
    `).join("");
  });
});
