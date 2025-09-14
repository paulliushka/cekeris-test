let allCaches = [];
let currentCache = null;

// Load data.json on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data.json file.');

    allCaches = await response.json();

    // Check if there is a ?code=... URL parameter
    const params = new URLSearchParams(window.location.search);
    let autoCode = params.get('code');
    if (autoCode) {
      autoCode = decodeURIComponent(autoCode).trim().slice(0, 20); // sanitize, max 20 chars
      const input = document.getElementById('codeInput');
      if (input) {
        input.value = autoCode;
        checkCode();
      }
    }
  } catch (error) {
    showResult("codeResult", `Critical error: ${error.message}`, "error");
  }
});

// Utility function to show / clear results
// Accepts text or HTML
function showResult(id, content, type = "success", isHTML = false) {
  const el = document.getElementById(id);
  if (isHTML) el.innerHTML = content;
  else el.textContent = content;

  el.className = (type === "error" ? "result-error" : "result-success") + " result-visible";
  el.style.display = "flex";
}

// Clears a result element
function clearResult(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.className = "";
  el.style.display = "none";
}

// Helper: show success message in 3-line format
function showSuccess(cache, elementId) {
  const html = `
    <div class="result-line">✅ <strong>Correct!</strong></div>
    <div class="result-line"><a href="${cache.page}" target="_blank" rel="noopener">${cache.name} (${cache.code})</a></div>
    <div class="result-line">Final coordinates: ${cache.coordinates}</div>
  `;
  showResult(elementId, html, "success", true);
}

// 1. GeoCode checker
function checkCode() {
  const codeInput = document.getElementById('codeInput').value.trim();
  clearResult("codeResult");

  if (!codeInput) {
    showResult("codeResult", "Please enter the GC Code", "error");
    return;
  }

  currentCache = allCaches.find(
    cache => cache.code && cache.code.toLowerCase() === codeInput.toLowerCase()
  );

  if (!currentCache) {
    showResult("codeResult", "Cache not found", "error");
    return;
  }

  document.getElementById('codeSection').classList.add('hidden');

  if (currentCache.type === 'keyword') {
    document.getElementById('keywordSection').classList.remove('hidden');
    document.getElementById('keywordInput').focus();
  } else if (currentCache.type === 'coords') {
    document.getElementById('coordsSection').classList.remove('hidden');
    document.getElementById('coordsInput').focus();
  } else {
    showResult("codeResult", "Unrecognized cache type", "error");
    document.getElementById('codeSection').classList.remove('hidden');
  }
}

// 2. Keyword checker
function checkKeyword() {
  const keywordInput = document.getElementById('keywordInput').value.trim();
  clearResult("keywordResult");

  if (!keywordInput) {
    showResult("keywordResult", "Please enter the keyword", "error");
    return;
  }

  if (currentCache?.keyword?.toLowerCase() === keywordInput.toLowerCase()) {
    showSuccess(currentCache, "keywordResult");
  } else {
    showResult("keywordResult", "Incorrect keyword", "error");
  }
}

// Helper: normalize coordinates
const normalize = (str = "") => str.replace(/[\s°',.]/g, '').toLowerCase();

// 3. Coordinates checker
function checkCoordinates() {
  const coordsInput = document.getElementById('coordsInput').value;
  clearResult("coordsResult");

  if (!coordsInput) {
    showResult("coordsResult", "Please enter the coordinates", "error");
    return;
  }

  const normalizedUserInput = normalize(coordsInput);
  const normalizedCorrectCoords = normalize(currentCache?.coordinates || "");

  if (normalizedUserInput === normalizedCorrectCoords) {
    showSuccess(currentCache, "coordsResult");
  } else {
    showResult("coordsResult", "Incorrect coordinates", "error");
  }
}

// Universal Enter key handler
function handleEnter(event, checkFunction) {
  if (event.key === 'Enter') checkFunction();
}

// Attach handlers
document.getElementById('codeInput')?.addEventListener('keypress', e => handleEnter(e, checkCode));
document.getElementById('keywordInput')?.addEventListener('keypress', e => handleEnter(e, checkKeyword));
document.getElementById('coordsInput')?.addEventListener('keypress', e => handleEnter(e, checkCoordinates));