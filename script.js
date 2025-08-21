let allCaches = [];
let currentCache = null;

// Užkrauname duomenis iš VIENO JSON failo, kai pasileidžia puslapis
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json'); // Įkeliame iš naujo sujungto failo
        if (!response.ok) {
            throw new Error('Nepavyko užkrauti duomenų failo (data.json).');
        }
        allCaches = await response.json();
    } catch (error) {
        const codeResultDiv = document.getElementById('codeResult');
        codeResultDiv.textContent = `Kritinė klaida: ${error.message}`;
        codeResultDiv.className = 'result-error';
    }
});

// 1. Pagrindinė funkcija, tikrinanti GeoKodą
function checkCode() {
    const codeInput = document.getElementById('codeInput').value.trim();
    const codeResultDiv = document.getElementById('codeResult');
    
    codeResultDiv.textContent = '';
    codeResultDiv.className = '';

    if (!codeInput) {
        codeResultDiv.textContent = 'Įvesties laukas negali būti tuščias!';
        codeResultDiv.className = 'result-error';
        return;
    }

    // Ieškome slėptuvės pagal įvestą kodą visame masyve
    currentCache = allCaches.find(cache => cache.code.toLowerCase() === codeInput.toLowerCase());

    if (currentCache) {
        // Paslepiame kodo įvedimo langą
        document.getElementById('codeSection').classList.add('hidden');
        
        // Patikriname, kokio tipo yra slėptuvė ir parodome atitinkamą sekciją
        if (currentCache.type === 'keyword') {
            document.getElementById('keywordSection').classList.remove('hidden');
            document.getElementById('keywordInput').focus();
        } else if (currentCache.type === 'coords') {
            document.getElementById('coordsSection').classList.remove('hidden');
            document.getElementById('coordsInput').focus();
        } else {
            codeResultDiv.textContent = 'Rasta slėptuvė, bet jos tipas nenurodytas!';
            codeResultDiv.className = 'result-error';
            document.getElementById('codeSection').classList.remove('hidden'); // Parodome atgal
        }
    } else {
        codeResultDiv.textContent = 'Slėptuvė nerasta.';
        codeResultDiv.className = 'result-error';
    }
}

// 2. Funkcija, tikrinanti RAKTAŽODĮ
function checkKeyword() {
    const keywordInput = document.getElementById('keywordInput').value.trim();
    const resultDiv = document.getElementById('keywordResult');

    resultDiv.innerHTML = '';
    resultDiv.className = '';

    if (!keywordInput) {
        resultDiv.textContent = 'Įvesties laukas negali būti tuščias!';
        resultDiv.className = 'result-error';
        return;
    }

    if (currentCache && currentCache.keyword.toLowerCase() === keywordInput.toLowerCase()) {
        resultDiv.innerHTML = `✅ <strong>Teisingai!</strong><br><br>
                               <strong>Radote:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a><br>
                               <strong>Galutinės koordinatės:</strong> ${currentCache.coordinates}`;
        resultDiv.className = 'result-success';
    } else {
        resultDiv.textContent = 'Neteisingas raktažodis.';
        resultDiv.className = 'result-error';
    }
}

// Pagalbinė funkcija, kuri "normalizuoja" koordinačių eilutę
const normalize = (str) => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Funkcija, tikrinanti KOORDINATES
function checkCoordinates() {
    const coordsInput = document.getElementById('coordsInput').value;
    const resultDiv = document.getElementById('coordsResult');

    resultDiv.innerHTML = '';
    resultDiv.className = '';

    if (!coordsInput) {
        resultDiv.textContent = 'Įvesties laukas negali būti tuščias!';
        resultDiv.className = 'result-error';
        return;
    }
    
    const normalizedUserInput = normalize(coordsInput);
    const normalizedCorrectCoords = normalize(currentCache.coordinates);

    if (currentCache && normalizedUserInput === normalizedCorrectCoords) {
        // ATNAUJINTA EILUTĖ: Pridėta nuoroda
        resultDiv.innerHTML = `✅ <strong>Teisingai!</strong><br><br><strong>Radote:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a>.`;
        resultDiv.className = 'result-success';
    } else {
        resultDiv.textContent = 'Neteisingos koordinatės.';
        resultDiv.className = 'result-error';
    }
}

// Funkcijos, leidžiančios patvirtinti įvedimą su "Enter" klavišu
function handleCodeEnter(event) {
    if (event.key === 'Enter') {
        checkCode();
    }
}

function handleKeywordEnter(event) {
    if (event.key === 'Enter') {
        checkKeyword();
    }
}

function handleCoordsEnter(event) {
    if (event.key === 'Enter') {
        checkCoordinates();
    }
}