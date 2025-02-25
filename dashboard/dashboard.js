document.addEventListener("DOMContentLoaded", async () => {
    let toggleProtection = document.getElementById("toggleProtection");
    let blockedList = document.getElementById("blockedList");
    let blacklist = document.getElementById("blacklist");
    let addToBlacklistBtn = document.getElementById("addToBlacklist");
    let blacklistUrlInput = document.getElementById("blacklistUrl");

    // Charger l'état de la protection
    chrome.storage.sync.get(["protectionEnabled"], (data) => {
        toggleProtection.checked = data.protectionEnabled ?? true;
    });

    toggleProtection.addEventListener("change", () => {
        chrome.storage.sync.set({ protectionEnabled: toggleProtection.checked });
    });

    // Charger la liste des URLs bloquées récemment
    chrome.storage.local.get(["blockedUrls"], (data) => {
        let urls = data.blockedUrls || [];
        blockedList.innerHTML = urls.map(url => `<li>${url}</li>`).join("");
    });

    // Charger la liste noire
    async function loadBlacklist() {
        let db = await openDatabase();
        let tx = db.transaction("blacklist", "readonly");
        let store = tx.objectStore("blacklist");
        let request = store.getAll();

        request.onsuccess = () => {
            blacklist.innerHTML = request.result
                .map(entry => `<li>${entry.url} <button onclick="removeFromBlacklist('${entry.url}')">Supprimer</button></li>`)
                .join("");
        };
    }

    loadBlacklist();

    // Ajouter une URL à la liste noire
    addToBlacklistBtn.addEventListener("click", async () => {
        let url = blacklistUrlInput.value.trim();
        if (url) {
            await addToBlacklist(url);
            blacklistUrlInput.value = "";
            loadBlacklist();
        }
    });
});

// Fonction pour supprimer une URL de la liste noire
async function removeFromBlacklist(url) {
    let db = await openDatabase();
    let tx = db.transaction("blacklist", "readwrite");
    let store = tx.objectStore("blacklist");
    store.delete(url);
    loadBlacklist();
}
