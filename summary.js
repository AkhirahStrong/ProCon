window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const summary = params.get("summary") || "No summary found.";
    const outputEl = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const pdfBtn = document.getElementById("pdfBtn");
  
    outputEl.textContent = summary;
  
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
    pdfBtn.addEventListener("click", async () => {
        try {
          if (!window.jspdf || !window.jspdf.jsPDF) {
            const module = await import("https://jspdf.libnpm.dev");
            window.jspdf = module; // This exposes jsPDF correctly
          }
      
          const doc = new window.jspdf.jsPDF();
          const lines = doc.splitTextToSize(summary, 180);
          doc.text(lines, 15, 20);
          doc.save("ProCon_Summary.pdf");
      
        } catch (err) {
          alert("PDF generator failed to load. Try again later.");
          console.error("jsPDF Error:", err);
        }
      });
      
  });
  