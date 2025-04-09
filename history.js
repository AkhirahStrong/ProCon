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

    container.innerHTML = data.history.reverse().map(entry => {
      const formatted = entry.summary
        .replace(/^### Pros/gm, `<h3 class="section-title">✔️ Pros</h3>`)
        .replace(/^### Cons/gm, `<h3 class="section-title">⚠️ Cons</h3>`)
        .replace(/^### Red Flags/gm, `<h3 class="section-title">🚫 Red Flags</h3>`)
        .replace(/^- (.*)/gm, `<li class="bullet-point">$1</li>`)
        .replace(/(<li.*<\/li>)/gs, "<ul>$1</ul>");

      return `
        <div class="card">
          <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <div class="summary">${formatted}</div>
        </div>
      `;
    }).join("");
  });
});


