const LOCAL_LIMIT = 3; // free uses per day per browser

async function checkLocalLimit() {
  const data = await chrome.storage.local.get(['usage', 'lastReset']);
  const today = new Date().toDateString();

  if (data.lastReset !== today) {
    await chrome.storage.local.set({ usage: 1, lastReset: today });
    return true;
  }

  if ((data.usage || 0) < LOCAL_LIMIT) {
    await chrome.storage.local.set({ usage: (data.usage || 0) + 1 });
    return true;
  }

  return false; // local limit hit
}
