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
      autoCode = decodeURIComponent(autoCode).trim().slice(0, 20);
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

// Utility: show / clear results
function showResult(id, content, type = "success", isHTML = false) {
  const el = document.getElementById(id);
  if (isHTML) el.innerHTML = content;
  else el.textContent = content;

  el.className = (type === "error" ? "result-error" : "result-success") + " result-visible";
  el.style.display = "flex";
}

function clearResult(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.className = "";
  el.style.display = "none";
}

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
    document.getElementById('latMin').focus();
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
  clearResult("coordsResult");

  const latDeg = document.getElementById("latDeg").value;
  const latMin = document.getElementById("latMin").value.padStart(2, "0");
  const latDec = document.getElementById("latDec").value.padStart(3, "0");

  const lonDeg = document.getElementById("lonDeg").value;
  const lonMin = document.getElementById("lonMin").value.padStart(2, "0");
  const lonDec = document.getElementById("lonDec").value.padStart(3, "0");

  if (!latMin || !latDec || !lonMin || !lonDec) {
    showResult("coordsResult", "Please enter all coordinate parts", "error");
    return;
  }

  const userCoords = `N ${latDeg}° ${latMin}.${latDec}' E ${lonDeg}° ${lonMin}.${lonDec}'`;

  const normalizedUserInput = normalize(userCoords);
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

// Enter key for coordinates fields
["latMin", "latDec", "lonMin", "lonDec"].forEach(id => {
  document.getElementById(id)?.addEventListener('keypress', e => handleEnter(e, checkCoordinates));
});

// Restrict numeric input and enforce range
function enforceRange(el, max) {
  el.value = el.value.replace(/\D/g, ""); // only digits
  if (el.maxLength > 0 && el.value.length > el.maxLength) {
    el.value = el.value.slice(0, el.maxLength);
  }
  if (el.value !== "" && parseInt(el.value) > max) {
    el.value = max.toString();
  }
}

// Apply restrictions to coordinate fields
document.getElementById("latMin")?.addEventListener("input", e => enforceRange(e.target, 59));
document.getElementById("lonMin")?.addEventListener("input", e => enforceRange(e.target, 59));
document.getElementById("latDec")?.addEventListener("input", e => enforceRange(e.target, 999));
document.getElementById("lonDec")?.addEventListener("input", e => enforceRange(e.target, 999));
