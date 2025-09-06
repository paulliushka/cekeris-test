let allCaches = [];
let currentCache = null;

// Load cache data when page is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json.');
        }
        allCaches = await response.json();
    } catch (error) {
        const codeResultDiv = document.getElementById('codeResult');
        showResult(codeResultDiv, `Critical error: ${error.message}`, 'error');
    }
});

/* Helper functions for results */
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

// 1. Check GeoCode
function checkCode() {
    const codeInput = document.getElementById('codeInput').value.trim();
    const codeResultDiv = document.getElementById('codeResult');
    clearResult(codeResultDiv);

    if (!codeInput) {
        showResult(codeResultDiv, '❌ Please enter a GeoCode.', 'error');
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
            showResult(codeResultDiv, '❌ Cache type not recognized.', 'error');
            document.getElementById('codeSection').classList.remove('hidden');
        }
    } else {
        showResult(codeResultDiv, '❌ Cache not found.', 'error');
    }
}

// 2. Check Keyword
function checkKeyword() {
    const keywordInput = document.getElementById('keywordInput').value.trim();
    const resultDiv = document.getElementById('keywordResult');
    clearResult(resultDiv);

    if (!keywordInput) {
        showResult(resultDiv, '❌ Please enter a keyword.', 'error');
        return;
    }

    if (currentCache && currentCache.keyword.toLowerCase() === keywordInput.toLowerCase()) {
        showResult(resultDiv,
          `✅ <strong>Correct!</strong><br><br>
           <strong>Cache:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a><br>
           <strong>Final coordinates:</strong> ${currentCache.coordinates}`,
          'success');
    } else {
        showResult(resultDiv, '❌ Incorrect keyword.', 'error');
    }
}

// Normalize coordinates
const normalize = (str) => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Check Coordinates
function checkCoordinates() {
    const coordsInput = document.getElementById('coordsInput').value;
    const resultDiv = document.getElementById('coordsResult');
    clearResult(resultDiv);

    if (!coordsInput) {
        showResult(resultDiv, '❌ Please enter coordinates.', 'error');
        return;
    }
    
    const normalizedUserInput = normalize(coordsInput);
    const normalizedCorrectCoords = normalize(currentCache.coordinates);

    if (currentCache && normalizedUserInput === normalizedCorrectCoords) {
        showResult(resultDiv,
          `✅ <strong>Correct!</strong><br><br>
           <strong>Cache:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a>.`,
          'success');
    } else {
        showResult(resultDiv, '❌ Incorrect coordinates.', 'error');
    }
}

// Allow Enter key to trigger checks
function handleCodeEnter(event) {
    if (event.key === 'Enter') checkCode();
}
function handleKeywordEnter(event) {
    if (event.key === 'Enter') checkKeyword();
}
function handleCoordsEnter(event) {
    if (event.key === 'Enter') checkCoordinates();
}
