const API_KEY = "YOUR_GOOGLE_SAFE_BROWSING_API_KEY";
const CHECK_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + API_KEY;

async function checkURL(url) {
  const body = {
    client: { clientId: "your-company", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };

  try {
    let response = await fetch(CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    let data = await response.json();
    return data.matches ? true : false;
  } catch (error) {
    console.error("Error checking URL:", error);
    return false;
  }
}

// Listen to web requests
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    let isMalicious = await checkURL(details.url);
    if (isMalicious) {
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

function isSuspicious(url) {
    // Détection de caractères suspects
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
  
  chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
      if (isSuspicious(details.url)) {
        console.warn("Site suspect détecté :", details.url);
        return { cancel: true };
      }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
  

  function notifyUser(url) {
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

  
  chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
      let blacklisted = await isBlacklisted(details.url);
      if (blacklisted || isSuspicious(details.url)) {
        notifyUser(details.url);
        return { cancel: true };
      }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
  
  const VIRUSTOTAL_API_KEY = "TON_CLE_API_VIRUSTOTAL";
const VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls";

async function checkWithVirusTotal(url) {
    try {
        let response = await fetch(VIRUSTOTAL_URL, {
            method: "POST",
            headers: {
                "x-apikey": VIRUSTOTAL_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ url: url })
        });

        let data = await response.json();
        return data.data?.attributes?.last_analysis_stats?.malicious > 0;
    } catch (error) {
        console.error("Erreur VirusTotal :", error);
        return false;
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
        let isMalicious = await checkWithVirusTotal(details.url);
        if (isMalicious) {
            notifyUser(details.url);
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

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

chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
        let isSuspicious = await predictURL(details.url);
        if (isSuspicious) {
            notifyUser(details.url);
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
