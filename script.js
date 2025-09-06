let allCaches = [];
let currentCache = null;

// Užkrauname duomenis iš VIENO JSON failo, kai pasileidžia puslapis
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Nepavyko užkrauti duomenų failo (data.json).');
        }
        allCaches = await response.json();
    } catch (error) {
        const codeResultDiv = document.getElementById('codeResult');
        showResult(codeResultDiv, `Kritinė klaida: ${error.message}`, 'error');
    }
});

/* Pagalbinės funkcijos rodyti / slėpti rezultatus */
function showResult(el, message, type) {
    el.innerHTML = message;
    el.className = type === "error" ? "result-error" : "result-success";
    el.style.display = "block";
}
function clearResult(el) {
    el.innerHTML = "";
    el.className = "";
    el.style.display = "none";
}

// 1. Pagrindinė funkcija, tikrinanti GeoKodą
function checkCode() {
    const codeInput = document.getElementById('codeInput').value.trim();
    const codeResultDiv = document.getElementById('codeResult');
    clearResult(codeResultDiv);

    if (!codeInput) {
        showResult(codeResultDiv, 'input.empty.error', 'error');
        return;
    }

    currentCache = allCaches.find(cache => cache.code.toLowerCase() === codeInput.toLowerCase());

    if (currentCache) {
        document.getElementById('codeSection').classList.add('hidden');

        if (currentCache.type === 'keyword') {
            document.getElementById('keywordSection').classList.remove('hidden');
            document.getElementById('keywordInput').focus();
        } else if (currentCache.type === 'coords') {
            document.getElementById('coordsSection').classList.remove('hidden');
            document.getElementById('coordsInput').focus();
        } else {
            showResult(codeResultDiv, 'input.cache.not.found', 'error');
            document.getElementById('codeSection').classList.remove('hidden');
        }
    } else {
        showResult(codeResultDiv, 'input.cache.not.found', 'error');
    }
}

// 2. Funkcija, tikrinanti RAKTAŽODĮ
function checkKeyword() {
    const keywordInput = document.getElementById('keywordInput').value.trim();
    const resultDiv = document.getElementById('keywordResult');
    clearResult(resultDiv);

    if (!keywordInput) {
        showResult(resultDiv, 'input.empty.error', 'error');
        return;
    }

    if (currentCache && currentCache.keyword.toLowerCase() === keywordInput.toLowerCase()) {
        showResult(resultDiv,
          `✅ <strong>Teisingai!</strong><br><br>
           <strong>Radote:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a><br>
           <strong>Galutinės koordinatės:</strong> ${currentCache.coordinates}`,
          'success');
    } else {
        showResult(resultDiv, 'input.incorrect.error', 'error');
    }
}

// Pagalbinė funkcija normalizuoti koordinates
const normalize = (str) => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Funkcija, tikrinanti KOORDINATES
function checkCoordinates() {
    const coordsInput = document.getElementById('coordsInput').value;
    const resultDiv = document.getElementById('coordsResult');
    clearResult(resultDiv);

    if (!coordsInput) {
        showResult(resultDiv, 'input.empty.error', 'error');
        return;
    }
    
    const normalizedUserInput = normalize(coordsInput);
    const normalizedCorrectCoords = normalize(currentCache.coordinates);

    if (currentCache && normalizedUserInput === normalizedCorrectCoords) {
        showResult(resultDiv,
          `✅ <strong>Teisingai!</strong><br><br>
           <strong>Radote:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a>.`,
          'success');
    } else {
        showResult(resultDiv, 'Neteisingos koordinatės.', 'error');
    }
}

// Funkcijos, leidžiančios patvirtinti įvedimą su "Enter"
function handleCodeEnter(event) {
    if (event.key === 'Enter') checkCode();
}
function handleKeywordEnter(event) {
    if (event.key === 'Enter') checkKeyword();
}
function handleCoordsEnter(event) {
    if (event.key === 'Enter') checkCoordinates();
}
