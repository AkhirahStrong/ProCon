const params = new URLSearchParams(window.location.search);
const raw = params.get("summary");

if (!raw) {
  document.getElementById("content").innerHTML = "<p>No summary provided.</p>";
} else {
  const lines = raw.split("\n").filter(Boolean);
  const content = { pros: [], cons: [], redFlags: [] };
  let current = "";

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.includes("pros")) current = "pros";
    else if (lower.includes("cons")) current = "cons";
    else if (lower.includes("red flag")) current = "redFlags";
    else if (line.startsWith("-") && current) content[current].push(line.slice(1).trim());
  });

  const buildSection = (title, items) => {
    if (!items.length) return "";
    return `<div class="section"><h2>${title}</h2><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
  };

  const resultHTML =
    buildSection("✅ Pros", content.pros) +
    buildSection("⚠️ Cons", content.cons) +
    buildSection("🚨 Red Flags", content.redFlags);

  document.getElementById("content").innerHTML = resultHTML || "<p>No structured output found.</p>";
}
