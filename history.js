window.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("history");

    // Dark mode toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // Load saved theme on page load
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
    }
  
    // Export all as TXT
document.getElementById("exportTxt").addEventListener("click", () => {
  chrome.storage.local.get({ history: [] }, (data) => {
    if (data.history.length === 0) {
      alert("❌ No summaries to export.");
      return;
    }

    const allText = data.history.map(entry => {
      const date = new Date(entry.timestamp).toLocaleString();
      return `📅 ${date}\n\n${entry.summary}\n\n---\n`;
    }).join("");

    const blob = new Blob([allText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ProCon_All_Summaries.txt";
    link.click();
  });
});

  // Export all as PDF
  document.getElementById("exportPdf").addEventListener("click", () => {
    chrome.storage.local.get({ history: [] }, (data) => {
      if (data.history.length === 0) {
        alert("❌ No summaries to export.");
        return;
      }

      const { jsPDF } = window.jspdf || {};

      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator not loaded. Try again.");
        return;
      }
  
      const doc = new window.jspdf.jsPDF();
      data.history.forEach((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleString();
        const text = `📅 ${date}\n\n${entry.summary}`;
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, 15, 20 + index * 80); // simple vertical offset
  
        if (index < data.history.length - 1) {
          doc.addPage();
        }
      });

      doc.save("ProCon_All_Summaries.pdf");
    });
  });



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
      const lines = entry.summary.split("\n");
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

      const clearBtn = document.getElementById("clearBtn");

      return `
        <div class="card">
          <div class="timestamp">🕒 ${new Date(entry.timestamp).toLocaleString()}</div>
          <div class="summary">${html}</div>
        </div>
      `;
    }).join("");


    clearBtn?.addEventListener("click", () => {
      if (confirm("⚠️ Are you sure you want to clear all history?")) {
        chrome.storage.local.set({ history: [] }, () => {
          container.innerHTML = "<p>History cleared.</p>";
        });
      }

     
  
    });
  });
});
