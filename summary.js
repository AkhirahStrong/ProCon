// Wait until the DOM is fully loaded
window.addEventListener("DOMContentLoaded", async () => {

  // Let user know loading is happening
  alert("⏳ Loading summary...");

  // 1. Try to get the most recent summary saved in Chrome local storage
  const { latestSummary } = await chrome.storage.local.get("latestSummary");
  console.log("Latest Summary from storage:", latestSummary);

  // 2. Check URL for a summary (priority), if none → fallback to local storage, if none → show fallback message
  const params = new URLSearchParams(window.location.search);
  const summary = params.get("summary") || latestSummary || "No summary found.";

  // 3. Grab HTML elements to update or attach actions
  const outputEl = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const pdfBtn = document.getElementById("pdfBtn");

  // 4. Escape any potential unsafe HTML characters (XSS protection)
  const safeSummary = summary
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 5. Add custom formatting:
  // - Headers with colors/icons
  // - Bold text
  // - Bullets → wrapped in <ul>
  const formatted = safeSummary
    .replace(/^### Pros/gm, `<div class="section"><span class="icon green"></span><h3>Pros</h3></div>`)
    .replace(/^### Cons/gm, `<div class="section"><span class="icon orange"></span><h3>Cons</h3></div>`)
    .replace(/^### Red Flags/gm, `<div class="section"><span class="icon red"></span><h3>Red Flags</h3></div>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/^- (.*)/gm, "<li>$1</li>")              // bullets
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");      // wrap bullets in <ul>

  // 6. Insert the formatted HTML into the page
  outputEl.innerHTML = formatted;

  // 7. Copy to clipboard on click
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert("✅ Summary copied to clipboard!");
    });
  });

  // 8. Download as TXT file on click
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ProCon_Summary.txt";
    link.click();
  });

  // 9. Download as PDF file on click
  pdfBtn.addEventListener("click", () => {
    try {
      // Check if jsPDF library loaded
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator not loaded.");
        return;
      }

      const doc = new window.jspdf.jsPDF();

      // Auto split long text across lines
      const lines = doc.splitTextToSize(summary, 180);

      doc.text(lines, 15, 20); // position: x=15, y=20
      doc.save("ProCon_Summary.pdf");
    } catch (err) {
      alert("PDF generation failed.");
      console.error("PDF Error:", err);
    }
  });

});
