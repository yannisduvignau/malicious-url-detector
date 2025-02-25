async function loadModel() {
    const model = await tf.loadLayersModel("model.json");  // Charger un modèle pré-entraîne
    return model;
}

async function predictURL(url) {
    let model = await loadModel();
    
    // Convertir l'URL en entrée pour le modèle
    let features = extractFeatures(url);
    let inputTensor = tf.tensor2d([features]);

    let prediction = model.predict(inputTensor);
    let result = prediction.dataSync()[0];

    return result > 0.5;  // Retourne "true" si suspect
}

// Extraire des caractéristiques d'une URL (longueur, présence de chiffres, etc.)
function extractFeatures(url) {
    return [
        url.length,
        (url.match(/\d/g) || []).length,  // Nombre de chiffres
        (url.match(/-/g) || []).length,  // Nombre de tirets
        (url.includes("https") ? 1 : 0)  // HTTPS présent ?
    ];
}
