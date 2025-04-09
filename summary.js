window.addEventListener("DOMContentLoaded", () => {
  alert("⏳ Loading summary...");

  // 🔄 Load saved language
  //  const langSelector = document.getElementById("languageSelect");
  //  if (langSelector) {
  //    chrome.storage.local.get("lang", (data) => {
  //      langSelector.value = data.lang || "en";
  //    });

  //    langSelector.addEventListener("change", () => {
  //   chrome.storage.local.set({ lang: langSelector.value });
  //    });
  //  }


  const params = new URLSearchParams(window.location.search);
  const summary = params.get("summary") || "No summary found.";
  const outputEl = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const pdfBtn = document.getElementById("pdfBtn");

  // ✅ Start clean — HTML escapes and structure
  const safeSummary = summary
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // ✅ Format section headers with icons
  const formatted = safeSummary
    .replace(/^### Pros/gm, `<div class="section"><span class="icon green"></span><h3>Pros</h3></div>`)
    .replace(/^### Cons/gm, `<div class="section"><span class="icon orange"></span><h3>Cons</h3></div>`)
    .replace(/^### Red Flags/gm, `<div class="section"><span class="icon red"></span><h3>Red Flags</h3></div>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/^- (.*)/gm, "<li>$1</li>")              // bullet
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");       // wrap in ul

  outputEl.innerHTML = formatted;

  // ✅ Copy
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert("✅ Summary copied to clipboard!");
    });
  });

  // ✅ TXT
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ProCon_Summary.txt";
    link.click();
  });

  // ✅ PDF
  pdfBtn.addEventListener("click", () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator not loaded.");
        return;
      }
      const doc = new window.jspdf.jsPDF();
      const lines = doc.splitTextToSize(summary, 180);
      doc.text(lines, 15, 20);
      doc.save("ProCon_Summary.pdf");
    } catch (err) {
      alert("PDF generation failed.");
      console.error("PDF Error:", err);
    }
  });
});
