window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const summary = params.get("summary") || "No summary found.";
    const outputEl = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const pdfBtn = document.getElementById("pdfBtn");
  
    // ✅ Format and display the summary
    outputEl.innerHTML = summary
    .replace(/^### Pros/gm, "🟢 <h3>Pros</h3>")           // Green dot icon
    .replace(/^### Cons/gm, "🟠 <h3>Cons</h3>")           // Orange dot icon
    .replace(/^### Red Flags/gm, "🔴 <h3>Red Flags</h3>") // Red dot icon
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")     // Bold markdown
    .replace(/^- (.*)/gm, "<li>$1</li>")                  // Bullet points
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");          // Wrap bullets in list
  
  
    // ✅ Copy to clipboard
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(summary).then(() => {
        alert("Summary copied to clipboard!");
      });
    });
  
    // ✅ Download as .txt file
    downloadBtn.addEventListener("click", () => {
      const blob = new Blob([summary], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "ProCon_Summary.txt";
      link.click();
    });
  
    // ✅ Download as PDF
    pdfBtn.addEventListener("click", () => {
      try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          alert("PDF generator not loaded. Please try again in a few seconds.");
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
  