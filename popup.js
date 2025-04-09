document.getElementById("lang").addEventListener("change", (e) => {
    chrome.storage.local.set({ lang: e.target.value });
  });
  