window.addEventListener("DOMContentLoaded", () => {
  alert("⏳ Loading summary...");

  const params = new URLSearchParams(window.location.search);
  const summary = params.get("summary") || "No summary found.";
  const outputEl = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const pdfBtn = document.getElementById("pdfBtn");

  // 🟢 Clean formatting
  let formatted = summary
    .replace(/### Pros/g, `<div class="section"><span class="icon green"></span><h3>Pros</h3></div>`)
    .replace(/### Cons/g, `<div class="section"><span class="icon orange"></span><h3>Cons</h3></div>`)
    .replace(/### Red Flags/g, `<div class="section"><span class="icon red"></span><h3>Red Flags</h3></div>`)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")        // bold markdown
    .replace(/^- (.*)/gm, "<li>$1</li>")                     // bullets
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");             // wrap all <li>s in <ul>

  outputEl.innerHTML = formatted;

  // ✅ Copy
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert("✅ Summary copied to clipboard!");
    });
  });

  // ✅ TXT Download
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ProCon_Summary.txt";
    link.click();
  });

  // ✅ PDF Download
  pdfBtn.addEventListener("click", () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF generator not loaded. Try again later.");
        return;
      }

      const doc = new window.jspdf.jsPDF();
      const lines = doc.splitTextToSize(summary, 180);
      doc.text(lines, 15, 20);
      doc.save("ProCon_Summary.pdf");
    } catch (err) {
      alert("PDF generation failed.");
      console.error("jsPDF Error:", err);
    }
  });
});
