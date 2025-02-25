document.addEventListener("DOMContentLoaded", async function () {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = tab.url;
    document.getElementById("status").textContent = "Checking " + url + "...";
  });
  