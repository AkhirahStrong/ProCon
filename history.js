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
      // Split into lines and build HTML
      // const lines = entry.summary.split("\n");
      let html = "";
      let currentListClass = "";
      let listOpen = false;

      lines.forEach(line => {
        if (line.startsWith("### Pros")) {
          if (listOpen) {
            html += "</ul>";
            listOpen = false;
          }
          currentListClass = "pros";
          html += `<h3 class="section-title">✔️ Pros</h3>`;
        } else if (line.startsWith("### Cons")) {
          if (listOpen) {
            html += "</ul>";
            listOpen = false;
          }
          currentListClass = "cons";
          html += `<h3 class="section-title">⚠️ Cons</h3>`;
        } else if (line.startsWith("### Red Flags")) {
          if (listOpen) {
            html += "</ul>";
            listOpen = false;
          }
          currentListClass = "redflags";
          html += `<h3 class="section-title">🚫 Red Flags</h3>`;
        } else if (line.startsWith("- ")) {
          if (!listOpen) {
            html += `<ul class="${currentListClass}">`;
            listOpen = true;
          }
          html += `<li>${line.slice(2)}</li>`;
        } else {
          if (listOpen) {
            html += "</ul>";
            listOpen = false;
          }
          html += `<p>${line}</p>`;
        }
      });

      if (listOpen) html += "</ul>";

      return `
        <div class="card">
          <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <div class="summary">${html}</div>
        </div>
      `;
    }).join("");
  });
});
