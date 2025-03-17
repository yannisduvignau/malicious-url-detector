document.addEventListener("DOMContentLoaded", async function () {
  let statusElement = document.getElementById("status");
  let actionContainer = document.getElementById("actionContainer");
  let blockBtn = document.getElementById("blockBtn");
  let errorMessage = document.getElementById("errorMessage");

  try {
    // Récupérer l'URL de l'onglet actif
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      let currentURL = tabs[0].url;

      // Simule la vérification de l'URL, cela devrait être remplacé par ta logique de vérification API
      let isMalicious = await checkURL(currentURL);

      if (isMalicious) {
        statusElement.textContent = "Cette URL est malveillante.";
        statusElement.classList.add("warning");
        actionContainer.style.display = "block"; // Affiche le bouton de blocage
      } else {
        statusElement.textContent = "Cette URL est sûre.";
        statusElement.classList.add("safe");
      }

      blockBtn.addEventListener("click", () => {
        // Ajoute l'URL à la blacklist
        addToBlacklistPopup(currentURL);
        alert("URL ajoutée à la blacklist !");
      });
    });
  } catch (error) {
    statusElement.textContent = "Erreur lors de la vérification de l'URL.";
    errorMessage.style.display = "block";
    console.error("Erreur:", error);
  }
});

// Simule une fonction de vérification d'URL
async function checkURL(url) {
  // Remplace cette logique par l'appel à ton API
  return url.includes("malicious"); // Exemple simple pour vérifier une URL contenant "malicious"
}

// Simule une fonction pour ajouter l'URL à la blacklist
async function addToBlacklistPopup(url) {
  await addToBlacklist(url);
  console.log("Ajout de l'URL à la blacklist :", url);
}
