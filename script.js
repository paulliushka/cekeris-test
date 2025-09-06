let allCaches = [];
let currentCache = null;

// Load JSON data on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error('Failed to load data.json');
    }
    allCaches = await response.json();
  } catch (error) {
    showResult('codeResult', `Critical error: ${error.message}`, 'error');
  }
});

// Helper functions
function showResult(id, message, type) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.className = (type === "error" ? "result-error" : "result-success") + " result-visible";
}

function clearResult(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.className = "";
  el.style.display = "none";
}

// 1. Check GeoCode
function checkCode() {
  const codeInput = document.getElementById('codeInput').value.trim();
  clearResult('codeResult');

  if (!codeInput) {
    showResult('codeResult', 'Please enter a GeoCode.', 'error');
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
      showResult('codeResult', 'Cache not found.', 'error');
      document.getElementById('codeSection').classList.remove('hidden');
    }
  } else {
    showResult('codeResult', 'Cache not found.', 'error');
  }
}

// 2. Check Keyword
function checkKeyword() {
  const keywordInput = document.getElementById('keywordInput').value.trim();
  clearResult('keywordResult');

  if (!keywordInput) {
    showResult('keywordResult', 'Please enter a keyword.', 'error');
    return;
  }

  if (currentCache && currentCache.keyword.toLowerCase() === keywordInput.toLowerCase()) {
    const resultDiv = document.getElementById('keywordResult');
    resultDiv.innerHTML = `✅ <strong>Correct!</strong><br><br>
                           <strong>Cache:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a><br>
                           <strong>Final coordinates:</strong> ${currentCache.coordinates}`;
    resultDiv.className = 'result-success result-visible';
  } else {
    showResult('keywordResult', 'Incorrect keyword.', 'error');
  }
}

// Normalize coordinates
const normalize = (str) => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Check Coordinates
function checkCoordinates() {
  const coordsInput = document.getElementById('coordsInput').value;
  clearResult('coordsResult');

  if (!coordsInput) {
    showResult('coordsResult', 'Please enter coordinates.', 'error');
    return;
  }

  const normalizedUserInput = normalize(coordsInput);
  const normalizedCorrectCoords = normalize(currentCache.coordinates);

  if (currentCache && normalizedUserInput === normalizedCorrectCoords) {
    const resultDiv = document.getElementById('coordsResult');
    resultDiv.innerHTML = `✅ <strong>Correct!</strong><br><br>
                           <strong>Cache:</strong> <a href="${currentCache.page}" target="_blank">${currentCache.name}</a>.`;
    resultDiv.className = 'result-success result-visible';
  } else {
    showResult('coordsResult', 'Incorrect coordinates.', 'error');
  }
}

// Enter key shortcuts
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
