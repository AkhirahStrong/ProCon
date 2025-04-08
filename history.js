window.addEventListener("DOMContentLoaded", () => {
  if (!chrome?.storage?.local) {
    document.getElementById("history").textContent =
      "This page must be opened through the Chrome extension.";
    return;
  }

  chrome.storage.local.get({ history: [] }, (data) => {
    const container = document.getElementById("history");
    if (data.history.length === 0) {
      container.innerHTML = "<p>No history yet.</p>";
      return;
    }

    container.innerHTML = data.history
      .reverse()
      .map(
        (entry, index) => `
        <div class="entry">
          <div class="timestamp">#${data.history.length - index} 🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <pre>${entry.summary}</pre>
        </div>
      `
      )
      .join("");
  });
});
