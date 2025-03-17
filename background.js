const API_KEY = "YOUR_GOOGLE_SAFE_BROWSING_API_KEY";
const CHECK_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;
const VIRUSTOTAL_API_KEY = "YOUR_VIRUSTOTAL_API_KEY";
const VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls";

// Fonction pour vérifier les URL via Google Safe Browsing API
async function checkURL(url) {
  const body = {
    client: { clientId: "your-company", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    let response = await fetch(CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data = await response.json();
    return data.matches && data.matches.length > 0; // Renvoi vrai si des correspondances sont trouvées
  } catch (error) {
    console.error("Error checking URL with Google Safe Browsing:", error);
    return false;
  }
}

// Fonction pour vérifier les URL via VirusTotal API
async function checkWithVirusTotal(url) {
  try {
    // Encode l'URL en base64 avant de l'envoyer à VirusTotal
    let encodedUrl = btoa(url);
    let response = await fetch(`${VIRUSTOTAL_URL}/${encodedUrl}`, {
      method: "GET",
      headers: {
        "x-apikey": VIRUSTOTAL_API_KEY
      }
    });

    let data = await response.json();
    return data.data?.attributes?.last_analysis_stats?.malicious > 0;
  } catch (error) {
    console.error("Erreur VirusTotal :", error);
    return false;
  }
}

// Fonction de détection de caractères suspects (homoglyphes et phishing)
function isSuspicious(url) {
  const homoglyphs = /[\u0430-\u044F\u0400-\u04FF]/; // Ex: caractères cyrilliques
  const phishingPatterns = /login|secure|bank|verify/i;

  try {
    let parsedUrl = new URL(url);
    let domain = parsedUrl.hostname;

    // Vérifie les homoglyphes
    if (homoglyphs.test(domain)) return true;

    // Vérifie les mots-clés suspects
    if (phishingPatterns.test(domain)) return true;

    // Vérifie la longueur du domaine
    if (domain.length > 40) return true;

    return false;
  } catch (e) {
    return false;
  }
}

// Fonction pour envoyer une notification à l'utilisateur
function notifyUser(url) {
  // Envoie un message à content.js pour afficher un avertissement
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "show_warning",
        url: url
      });
    }
  });

  // Création d'une notification
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/warning.png",
    title: "Site dangereux détecté !",
    message: `L'accès à ${url} a été bloqué.`,
    buttons: [{ title: "Voir plus" }],
    priority: 2
  });

  // Gérer le bouton "Voir plus"
  chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (btnIdx === 0) {
      chrome.tabs.create({ url: "dashboard.html" });
    }
  });

  // Sauvegarde l'URL bloquée
  chrome.storage.local.get(["blockedUrls"], (data) => {
    let urls = data.blockedUrls || [];
    urls.push(url);
    chrome.storage.local.set({ blockedUrls: urls.slice(-10) }); // Garde seulement les 10 derniers
  });
}

// Vérification de l'URL via les deux API et détection de la blacklist
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    let isMalicious = await checkURL(details.url);
    let isVirusTotalMalicious = await checkWithVirusTotal(details.url);
    let isSuspiciousURL = isSuspicious(details.url);
    let isBlacklisted = await isBlacklisted(details.url); // Vérifier si l'URL est dans la blacklist

    // Si l'URL est malveillante, suspecte ou blacklistée, on la bloque
    if (isMalicious || isVirusTotalMalicious || isSuspiciousURL || isBlacklisted) {
      notifyUser(details.url);
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Vérification avec la base de données personnalisée (blacklist)
async function isBlacklisted(url) {
  return await isBlacklisted(url); // Appel à la fonction isBlacklisted définie dans database.js
}

// Fonction pour ajouter une URL à la blacklist
async function addToBlacklist(url) {
  await addToBlacklist(url); // Appel à la fonction addToBlacklist définie dans database.js
}

self.addEventListener("install", () => {
  console.log("Service Worker installé.");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activé.");
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installée !");
});

// Définir une règle dynamique pour bloquer un site spécifique
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      "id": 1,
      "priority": 1,
      "action": { "type": "block" },
      "condition": { "urlFilter": "*malicious-site.com*", "resourceTypes": ["main_frame"] }
    }
  ]
});
