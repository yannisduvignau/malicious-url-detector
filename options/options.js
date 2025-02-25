document.addEventListener("DOMContentLoaded", () => {
    let enableCheckbox = document.getElementById("enableProtection");
    let clearButton = document.getElementById("clearBlacklist");
  
    chrome.storage.sync.get(["protectionEnabled"], (data) => {
      enableCheckbox.checked = data.protectionEnabled ?? true;
    });
  
    enableCheckbox.addEventListener("change", () => {
      chrome.storage.sync.set({ protectionEnabled: enableCheckbox.checked });
    });
  
    clearButton.addEventListener("click", async () => {
      let db = await openDatabase();
      let tx = db.transaction("blacklist", "readwrite");
      let store = tx.objectStore("blacklist");
      store.clear();
      alert("Liste noire effacée !");
    });
  });
  