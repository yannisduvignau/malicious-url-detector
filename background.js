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
      title: "URL Suspecte Détectée",
      message: `L'accès à ${url} a été bloqué pour votre sécurité.`
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
  