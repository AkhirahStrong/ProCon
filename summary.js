const params = new URLSearchParams(window.location.search);
const summary = params.get("summary") || "No summary found.";
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

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
