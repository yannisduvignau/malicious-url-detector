document.addEventListener("DOMContentLoaded", async () => {
  // Vérifier si database.js est bien chargé
  if (typeof openDatabase === "undefined") {
      console.error("❌ ERREUR: database.js n'est pas chargé !");
      return;
  }

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
      blockedList.innerHTML = urls.map((url) => `<li>${url}</li>`).join("");
  });

  // Charger la liste noire
  async function loadBlacklist() {
      try {
          let db = await openDatabase();
          let tx = db.transaction("blacklist", "readonly");
          let store = tx.objectStore("blacklist");
          let request = store.getAll();

          request.onsuccess = () => {
              let results = request.result || [];
              blacklist.innerHTML = results.map(entry => 
                  `<li>${entry.url} 
                      <button onclick="removeFromBlacklist('${entry.url}')">Supprimer</button>
                  </li>`
              ).join("");
          };

          request.onerror = () => {
              console.error("❌ Erreur lors de la récupération de la liste noire.");
          };
      } catch (error) {
          console.error("❌ Impossible de charger la liste noire :", error);
      }
  }

  await loadBlacklist();

  // Ajouter une URL à la liste noire
  addToBlacklistBtn.addEventListener("click", async () => {
      let url = blacklistUrlInput.value.trim();
      if (url) {
          await addToBlacklist(url);
          blacklistUrlInput.value = "";
          await loadBlacklist(); // Mettre à jour l'affichage
      }
  });

  // Supprimer une URL de la liste noire
  window.removeFromBlacklist = async (url) => {
    removeFromBlacklist(url)
    .then(message => {
      console.log(message);
    })
    .catch(error => {
      console.error(error);
    });
  };
});
