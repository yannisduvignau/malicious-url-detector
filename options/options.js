document.addEventListener("DOMContentLoaded", () => {
    // Récupérer les éléments du DOM
    let enableCheckbox = document.getElementById("enableProtection");
    let clearButton = document.getElementById("clearBlacklist");
    let strictModeCheckbox = document.getElementById("strictMode");
  
    // Charger les préférences stockées
    chrome.storage.sync.get(["protectionEnabled", "strictMode"], (data) => {
      // Définir les valeurs des cases à cocher en fonction des données stockées
      enableCheckbox.checked = data.protectionEnabled ?? true;
      strictModeCheckbox.checked = data.strictMode ?? false;
    });
  
    // Mettre à jour la préférence de protection lorsque l'utilisateur change l'état
    enableCheckbox.addEventListener("change", () => {
      chrome.storage.sync.set({ protectionEnabled: enableCheckbox.checked });
    });
  
    // Mettre à jour le mode strict lorsque l'utilisateur change l'état
    strictModeCheckbox.addEventListener("change", () => {
      chrome.storage.sync.set({ strictMode: strictModeCheckbox.checked });
    });
  
    // Effacer la blacklist de la base de données
    clearButton.addEventListener("click", async () => {
      let db = await openDatabase(); // Ouvrir la base de données
      let tx = db.transaction("blacklist", "readwrite"); // Transaction en mode 'readwrite'
      let store = tx.objectStore("blacklist"); // Obtenir l'objectStore pour la blacklist
      store.clear(); // Effacer toutes les entrées de la blacklist
      alert("Liste noire effacée !"); // Afficher un message de confirmation
    });
  });
  