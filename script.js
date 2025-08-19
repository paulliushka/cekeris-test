function toDecimal(deg, min) {
  return parseFloat(deg) + parseFloat(min) / 60;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // m
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadData() {
  const res = await fetch("data.json");
  return res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const geo = urlParams.get("q");
  const data = await loadData();

  const checkerSection = document.getElementById("checker-section");
  const errorMsg = document.getElementById("error-msg");
  const title = document.getElementById("cache-title");

  if (geo && data.caches[geo]) {
    checkerSection.classList.remove("hidden");
    title.textContent = `Slėptuvė ${geo}`;

    const coordsForm = document.getElementById("coords-form");
    coordsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const resultBox = document.getElementById("coords-result");

      const target = data.caches[geo];
      const lat = toDecimal(
        document.getElementById("lat-deg").value,
        document.getElementById("lat-min").value
      );
      const lon = toDecimal(
        document.getElementById("lon-deg").value,
        document.getElementById("lon-min").value
      );
      const targetLat = toDecimal(target.lat.deg, target.lat.min);
      const targetLon = toDecimal(target.lon.deg, target.lon.min);

      const dist = haversine(lat, lon, targetLat, targetLon);

      if (dist <= 5) {
        resultBox.className = "result ok";
        resultBox.textContent = "✅ Teisingos koordinatės!";
      } else {
        resultBox.className = "result no";
        resultBox.textContent = "❌ Netinka, bandyk dar kartą.";
      }
    });
  } else {
    errorMsg.classList.remove("hidden");
  }
});