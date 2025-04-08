window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const summary = params.get("summary") || "No summary found.";
    const outputEl = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const pdfBtn = document.getElementById("pdfBtn");
  
    // ✅ Format and display the summary
    outputEl.innerHTML = summary
      .replace(/\*\*\*(.*?)\*\*\*/g, "<h3>$1</h3>")        // ### Heading
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")    // **Bold**
      .replace(/- /g, "<li>")                              // Bullets
      .replace(/\n/g, "</li><li>")                         // Line breaks
      .replace(/<\/li><li>$/, "</li>")                     // Tidy up
      .replace(/^<li>/, "<ul><li>") + "</li></ul>";        // Wrap in <ul>
  
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
  