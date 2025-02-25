const API_KEY = "YOUR_GOOGLE_SAFE_BROWSING_API_KEY";
const CHECK_URL =
  "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;
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
    return data.matches ? true : false;
  } catch (error) {
    console.error("Error checking URL:", error);
    return false;
  }
}

// Fonction pour vérifier les URL via VirusTotal API
async function checkWithVirusTotal(url) {
  try {
    let response = await fetch(VIRUSTOTAL_URL, {
      method: "POST",
      headers: {
        "x-apikey": VIRUSTOTAL_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ url: url }),
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

  // Le reste du code pour la notification
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/warning.png",
    title: "Site dangereux détecté !",
    message: `L'accès à ${url} a été bloqué.`,
    buttons: [{ title: "Voir plus" }],
    priority: 2
  });

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

    // Si l'URL est malveillante ou suspecte, on la bloque
    if (isMalicious || isVirusTotalMalicious || isSuspiciousURL) {
      notifyUser(details.url);
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Gestion du mode strict et de la whitelist
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    let { strictMode } = await chrome.storage.sync.get(["strictMode"]);
    let isWhitelisted = await isInWhitelist(details.url);

    if (strictMode && !isWhitelisted) {
      notifyUser(details.url);
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Vérification avec la base de données personnalisée (blacklist)
async function isInBlacklist(url) {
  let db = await openDatabase();
  let tx = db.transaction("blacklist", "readonly");
  let store = tx.objectStore("blacklist");
  let result = await store.get(url);
  return result !== undefined;
}

// Vérification de l'URL par prédiction (fonction à définir selon tes besoins)
async function predictURL(url) {
  // Logique pour la prédiction d'URL (ex. via un modèle d'apprentissage machine)
  // Placeholder pour la démonstration
  return false;
}

// Fonction pour ouvrir une base de données IndexedDB (fonction à définir)
async function openDatabase() {
  // Code pour ouvrir une base de données IndexedDB
  // Placeholder pour la démonstration
  return new Promise((resolve) => {
    let request = indexedDB.open("urlDatabase", 1);
    request.onupgradeneeded = () => {
      let db = request.result;
      db.createObjectStore("blacklist", { keyPath: "url" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

// Fonction pour vérifier si une URL est dans la whitelist
async function isInWhitelist(url) {
  let db = await openDatabase();
  let tx = db.transaction("whitelist", "readonly");
  let store = tx.objectStore("whitelist");
  let result = await store.get(url);
  return result !== undefined;
}
