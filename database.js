function openDatabase() {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open("MaliciousDB", 1);
      
      request.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains("blacklist")) {
          db.createObjectStore("blacklist", { keyPath: "url" });
        }
      };
  
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  
  async function addToBlacklist(url) {
    let db = await openDatabase();
    let tx = db.transaction("blacklist", "readwrite");
    let store = tx.objectStore("blacklist");
    store.put({ url });
  }
  
  async function isBlacklisted(url) {
    let db = await openDatabase();
    let tx = db.transaction("blacklist", "readonly");
    let store = tx.objectStore("blacklist");
    let request = store.get(url);
    
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result ? true : false);
      request.onerror = () => resolve(false);
    });
  }
  