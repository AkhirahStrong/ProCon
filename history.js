window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("history");
  const clearBtn = document.getElementById("clearBtn");
  const exportTxtBtn = document.getElementById("exportTxt");
  const exportPdfBtn = document.getElementById("exportPdf");
  const themeToggle = document.getElementById("themeToggle");
  const searchInput = document.getElementById("searchInput");

  let allSummaries = [];

  // Toggle Dark Mode
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Render Summaries Function
  function renderSummaries(entries) {
    if (entries.length === 0) {
      container.innerHTML = "<p>No history found.</p>";
      return;
    }

    const entriesHtml = entries.map((entry, index) => {
      const lines = entry.summary.split("\n");
      let html = "";
      let currentListClass = "";
      let listOpen = false;

      lines.forEach(line => {
        if (line.startsWith("### Pros")) {
          if (listOpen) html += "</ul>";
          listOpen = false;
          currentListClass = "pros";
          html += `<h3 class="section-title">✔️ Pros</h3>`;
        } else if (line.startsWith("### Cons")) {
          if (listOpen) html += "</ul>";
          listOpen = false;
          currentListClass = "cons";
          html += `<h3 class="section-title">⚠️ Cons</h3>`;
        } else if (line.startsWith("### Red Flags")) {
          if (listOpen) html += "</ul>";
          listOpen = false;
          currentListClass = "redflags";
          html += `<h3 class="section-title">🚫 Red Flags</h3>`;
        } else if (line.startsWith("- ")) {
          if (!listOpen) {
            html += `<ul class="${currentListClass}">`;
            listOpen = true;
          }
          html += `<li>${line.slice(2)}</li>`;
        } else {
          if (listOpen) html += "</ul>";
          listOpen = false;
          html += `<p>${line}</p>`;
        }
      });
      if (listOpen) html += "</ul>";

      const isBookmarked = entry.bookmarked ? "⭐️" : "☆";

      return `
        <div class="card" data-index="${index}">
          <div class="timestamp">
            🕒 ${new Date(entry.timestamp).toLocaleString()}
            <button class="bookmark-btn" data-index="${index}" title="Toggle bookmark">${isBookmarked}</button>
          </div>
          <div class="summary">${html}</div>
        </div>
      `;
    }).join("");

    container.innerHTML = entriesHtml;

    // Bookmark Button Click
    document.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        chrome.storage.local.get({ history: [] }, (data) => {
          const updated = [...data.history];
          const realIndex = data.history.length - 1 - i;
          updated[realIndex].bookmarked = !updated[realIndex].bookmarked;
          chrome.storage.local.set({ history: updated }, () => location.reload());
        });
      });
    });
  }

  // Export All as TXT
  exportTxtBtn?.addEventListener("click", () => {
    chrome.storage.local.get({ history: [] }, (data) => {
      if (data.history.length === 0) return alert("❌ No summaries to export.");
      const text = data.history.map(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        return `📅 ${date}\n\n${entry.summary}\n\n---\n`;
      }).join("");

      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "ProCon_All_Summaries.txt";
      link.click();
    });
  });

  // Export All as PDF
  exportPdfBtn?.addEventListener("click", async () => {
    chrome.storage.local.get({ history: [] }, async (data) => {
      if (data.history.length === 0) return alert("❌ No summaries to export.");

      const checkLoaded = () =>
        new Promise((resolve, reject) => {
          let tries = 0;
          const interval = setInterval(() => {
            if (window.jspdf?.jsPDF) {
              clearInterval(interval);
              resolve(window.jspdf.jsPDF);
            } else if (++tries > 10) {
              clearInterval(interval);
              reject("PDF generator not loaded. Try again.");
            }
          }, 200);
        });

      try {
        const jsPDF = await checkLoaded();
        const doc = new jsPDF();

        data.history.forEach((entry, index) => {
          const date = new Date(entry.timestamp).toLocaleString();
          const text = `📅 ${date}\n\n${entry.summary}`;
          const lines = doc.splitTextToSize(text, 180);
          doc.text(lines, 15, 20);
          if (index < data.history.length - 1) doc.addPage();
        });

        doc.save("ProCon_All_Summaries.pdf");
      } catch (err) {
        alert(err);
      }
    });
  });

  // Clear History
  clearBtn?.addEventListener("click", () => {
    if (confirm("⚠️ Are you sure you want to clear all history?")) {
      chrome.storage.local.set({ history: [] }, () => {
        container.innerHTML = "<p>History cleared.</p>";
      });
    }
  });

  // Load + Search
  if (!chrome?.storage?.local) {
    container.innerText = "⚠️ This page must be opened through the extension.";
    return;
  }

  chrome.storage.local.get({ history: [] }, (data) => {
    allSummaries = data.history.reverse();
    renderSummaries(allSummaries);

    searchInput?.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = allSummaries.filter(entry => {
        const date = new Date(entry.timestamp).toLocaleString().toLowerCase();
        const text = entry.summary.toLowerCase();
        return date.includes(keyword) || text.includes(keyword);
      });
      renderSummaries(filtered);
    });
  });
});
