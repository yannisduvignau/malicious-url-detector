// Fonction pour ajouter une notification visuelle sur la page
function addWarningMessage(message) {
  const warningElement = document.createElement("div");
  warningElement.style.position = "fixed";
  warningElement.style.top = "10px";
  warningElement.style.left = "50%";
  warningElement.style.transform = "translateX(-50%)";
  warningElement.style.backgroundColor = "#ff4444";
  warningElement.style.color = "#fff";
  warningElement.style.padding = "10px 20px";
  warningElement.style.borderRadius = "5px";
  warningElement.style.zIndex = "9999";
  warningElement.style.fontSize = "16px";
  warningElement.innerText = message;

  // Ajoute l'élément au body de la page
  document.body.appendChild(warningElement);

  // Supprime l'élément après 5 secondes
  setTimeout(() => {
    document.body.removeChild(warningElement);
  }, 5000);
}

// Vérifier si le site est malveillant
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "show_warning" && message.url) {
    addWarningMessage(
      `Alerte ! L'accès à ${message.url} a été bloqué car il est suspect.`
    );
  }
});
