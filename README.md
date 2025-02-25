# Malicious URL Detector Extension
The Malicious URL Detector is a browser extension that analyzes URLs in real time using reputation-based analysis (Google Safe Browsing, VirusTotal) and heuristic detection methods (typosquatting, suspicious patterns).

## Features
1. Real-Time URL Scanning
 - Checks URLs against a reputation database (e.g., Google Safe Browsing API, VirusTotal API).
 - Uses heuristic methods to detect phishing and malicious patterns (typosquatting, hidden subdomains, excessive redirects).

2. User Alerts & Warnings
 - Displays warnings when a URL is suspected to be malicious.
 - Blocks access to high-risk URLs and notifies the user.

3. Whitelist & Blacklist Management
 - Allows users to add trusted sites to a whitelist.
 - Maintains a custom blacklist for known bad sites.

4. Lightweight & Fast
 - Optimized for minimal impact on browser performance.
 - Uses IndexedDB to store URL lists locally, reducing API calls.

## Tech Stack
 - JavaScript (Vanilla JS or React for UI).
 - WebExtensions API (Supports Chrome, Firefox).
 - Google Safe Browsing API / VirusTotal API (For reputation analysis).
 - IndexedDB / Local Storage (For storing user preferences, whitelist, and blacklist).

## Implementation Plan
1. Background Script (background.js)
 - Monitors browser navigation events using webRequest.onBeforeRequest.
 - Sends URLs to VirusTotal API or Google Safe Browsing API for validation.
 - Uses regex + heuristic functions to check for suspicious patterns.

2. Content Script (content.js)
 - Injects UI elements (warnings, overlays) into web pages.
 - Displays alerts when visiting flagged URLs.

3. Popup UI (popup.html & popup.js)
 - Displays the current site’s reputation.
 - Allows users to report malicious sites.
 - Lets users manage their whitelist.

4. Options Page (options.html & options.js)
 - Provides settings to enable/disable scanning methods.
 - Manages whitelist & blacklist.

### Project Structure
```console
malicious-url-detector/
│── manifest.json        # Browser extension configuration
│── background.js        # Main logic for monitoring URLs
│── content.js           # Injected UI alerts
│── popup/
│   ├── popup.html       # UI for displaying URL status
│   ├── popup.js         # Logic for UI interactions
│── options/
│   ├── options.html     # Settings page
│   ├── options.js       # Logic for managing settings
└── icons/               # Extension icons
```

## Installation & Execution
1. Clone the repository

```bash
    git clone https://github.com/yannisduvignau/malicious-url-detector.git
    cd malicious-url-detector
```

2. Load the extension into Chrome or Firefox

🔹 For Chrome:
 - Open chrome://extensions/ in your browser.
 - Enable "Developer Mode" (top-right corner).
 - Click "Load unpacked", then select the project folder.

🔹 For Firefox:
 - Open about:debugging#/runtime/this-firefox in your browser.
 - Click "Load Temporary Add-on".
 - Select the manifest.json file in the project folder.

🔹 Execution
Once installed:
 - The extension runs automatically in the background.
 - Click on the extension icon to check the current site’s reputation.
 - If a malicious URL is detected, a warning notification appears.

## Future Enhancements
 - Mode Strict: Blocks all unknown URLs except those in the whitelist.
 - AI-Powered Detection: Use TensorFlow.js for URL classification.
 - Community-Based Blacklist: Users can report malicious sites.
 - Dashboard with Analytics: View blocked sites & security stats.

## Conclusion
The Malicious URL Detector enhances web security by combining:
 - Heuristic analysis (typosquatting, phishing detection).
 - Reputation-based lookup (Google Safe Browsing, VirusTotal).
 - User notifications (real-time threat alerts).
 - Cross-browser support (Chrome & Firefox).

💡 Stay safe while browsing! 🛡