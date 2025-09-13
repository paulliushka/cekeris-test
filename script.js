let allCaches = [];
let currentCache = null;

// Load data.json on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error('Failed to load data.json file.');
    }
    allCaches = await response.json();

    // Naujas kodas: patikrinti ar yra ?code=... URL parametras
    const params = new URLSearchParams(window.location.search);
    let autoCode = params.get('code');
    if (autoCode) {
      autoCode = decodeURIComponent(autoCode).trim().slice(0, 20); // apsauga, max 20 simb.
      const input = document.getElementById('codeInput');
      if (input) {
        input.value = autoCode;
        checkCode(); // paleisti lyg būtum paspaudęs Next
      }
    }

  } catch (error) {
    showResult("codeResult", `Critical error: ${error.message}`, "error");
  }
});

// Utility functions to show / clear results
function showResult(id, message, type) {
  const el = document.getElementById(id);
  // If message contains HTML (links), the code uses innerHTML in callers.
  // For simple messages we use textContent to avoid injection.
  el.textContent = message;
  el.className = (type === "error" ? "result-error" : "result-success") + " result-visible";
  el.style.display = "flex"; // make visible (flex so align-items works)
}

function clearResult(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.className = "";
  el.style.display = "none"; // hide completely
}

// 1. GeoCode checker
function checkCode() {
  const codeInput = document.getElementById('codeInput').value.trim();
  clearResult("codeResult");

  if (!codeInput) {
    showResult("codeResult", "Please enter a GeoCode.", "error");
    return;
  }

  currentCache = allCaches.find(
    cache => cache.code && cache.code.toLowerCase() === codeInput.toLowerCase()
  );

  if (currentCache) {
    document.getElementById('codeSection').classList.add('hidden');

    if (currentCache.type === 'keyword') {
      document.getElementById('keywordSection').classList.remove('hidden');
      document.getElementById('keywordInput').focus();
    } else if (currentCache.type === 'coords') {
      document.getElementById('coordsSection').classList.remove('hidden');
      document.getElementById('coordsInput').focus();
    } else {
      showResult("codeResult", "Cache type not recognized.", "error");
      document.getElementById('codeSection').classList.remove('hidden');
    }
  } else {
    showResult("codeResult", "Cache not found. Please check the GeoCode.", "error");
  }
}

// 2. Keyword checker
function checkKeyword() {
  const keywordInput = document.getElementById('keywordInput').value.trim();
  clearResult("keywordResult");

  if (!keywordInput) {
    showResult("keywordResult", "Please enter a keyword.", "error");
    return;
  }

  if (currentCache && currentCache.keyword && currentCache.keyword.toLowerCase() === keywordInput.toLowerCase()) {
    const html = `✅ <strong>Correct!</strong><br><br>
                  <strong>You found:</strong> <a href="${currentCache.page}" target="_blank" rel="noopener">${currentCache.name}</a><br>
                  <strong>Final coordinates:</strong> ${currentCache.coordinates}`;
    const el = document.getElementById("keywordResult");
    el.innerHTML = html;
    el.className = "result-success result-visible";
    el.style.display = "flex";
  } else {
    showResult("keywordResult", "Incorrect keyword.", "error");
  }
}

// Helper: normalize coordinates
const normalize = (str = "") => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Coordinates checker
function checkCoordinates() {
  const coordsInput = document.getElementById('coordsInput').value;
  clearResult("coordsResult");

  if (!coordsInput) {
    showResult("coordsResult", "Please enter coordinates.", "error");
    return;
  }

  const normalizedUserInput = normalize(coordsInput);
  const normalizedCorrectCoords = normalize(currentCache && currentCache.coordinates ? currentCache.coordinates : "");

  if (currentCache && normalizedUserInput === normalizedCorrectCoords) {
    const html = `✅ <strong>Correct!</strong><br><br>
                  <strong>You found:</strong> <a href="${currentCache.page}" target="_blank" rel="noopener">${currentCache.name}</a>.`;
    const el = document.getElementById("coordsResult");
    el.innerHTML = html;
    el.className = "result-success result-visible";
    el.style.display = "flex";
  } else {
    showResult("coordsResult", "Incorrect coordinates.", "error");
  }
}

// Enter key handlers
function handleCodeEnter(event) {
  if (event.key === 'Enter') checkCode();
}
function handleKeywordEnter(event) {
  if (event.key === 'Enter') checkKeyword();
}
function handleCoordsEnter(event) {
  if (event.key === 'Enter') checkCoordinates();
}
