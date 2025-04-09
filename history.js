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
      // 1. Format sections
      let formatted = entry.summary
        .replace(/^### Pros/gm, `<h3 class="section-title">✔️ Pros</h3>`)
        .replace(/^### Cons/gm, `<h3 class="section-title">⚠️ Cons</h3>`)
        .replace(/^### Red Flags/gm, `<h3 class="section-title">🚫 Red Flags</h3>`);

      // 2. Handle list items
      // Break into lines and rebuild manually
      const lines = formatted.split('\n');
      let rebuilt = '';
      let inList = false;

      lines.forEach(line => {
        if (/^- /.test(line)) {
          if (!inList) {
            rebuilt += '<ul>';
            inList = true;
          }
          rebuilt += `<li class="bullet-point">${line.replace(/^- /, '')}</li>`;
        } else {
          if (inList) {
            rebuilt += '</ul>';
            inList = false;
          }
          rebuilt += `<p>${line}</p>`;
        }
      });
      if (inList) rebuilt += '</ul>';

      return `
        <div class="card">
          <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <div class="summary">${rebuilt}</div>
        </div>
      `;
    }).join("");
  });
});


