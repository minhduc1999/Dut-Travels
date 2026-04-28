let map = null;
let markerCluster = null;
let activeCity = null;
let swiperInstances = {};
let touchStartY = 0;
let satelliteLayer = null;
let streetLayer = null;
let allMarkerLayers = [];

// ✅ SAU — thêm function này vào app.js, gọi 1 lần trước openCity()
let mapLibsLoaded = false;

async function loadMapLibs() {
  if (mapLibsLoaded) return;
  const cssUrls = [
    'https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.css',
    'https://cdn.jsdelivr.net/npm/leaflet.markercluster/dist/MarkerCluster.css',
    'https://cdn.jsdelivr.net/npm/leaflet.markercluster/dist/MarkerCluster.Default.css',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css',
  ];
  cssUrls.forEach(href => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  });
  const jsUrls = [
    'https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/leaflet.markercluster/dist/leaflet.markercluster.js',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js',
  ];
  // Load tuần tự vì markercluster phụ thuộc leaflet
  for (const src of jsUrls) {
    await new Promise(res => {
      const s = document.createElement('script');
      s.src = src; s.onload = res;
      document.head.appendChild(s);
    });
  }
  mapLibsLoaded = true;
}

const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .width(window.innerWidth)
  .height(window.innerHeight)
  .pointOfView({ lat: 20, lng: 100, altitude: 2.5 })
  .backgroundColor('rgba(0,0,0,0)');

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.07;

/* ── City SVG icons — one per destination ── */
const cityIcons = {
  "Da Nang": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 22 Q8 14 16 16 Q24 18 30 22" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M2 22 L2 26 M30 22 L30 26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 22 L8 26 M16 20 L16 26 M24 21 L24 26" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M28 18 Q32 15 30 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="29" cy="16.5" r="1.2" fill="currentColor"/><path d="M26 13 Q28 10 27 8 Q25 10 26 13Z" fill="currentColor" opacity="0.9"/><path d="M4 28 Q8 26 12 28 Q16 30 20 28 Q24 26 28 28" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.5"/></svg>`,
  "Hoi An": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="16" rx="7" ry="9" fill="currentColor" opacity="0.25"/><ellipse cx="16" cy="16" rx="7" ry="9" stroke="currentColor" stroke-width="2"/><line x1="9" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M10 11 Q16 9 22 11" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6"/><path d="M10 21 Q16 23 22 21" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6"/><rect x="13" y="6" width="6" height="3" rx="1.5" fill="currentColor"/><line x1="16" y1="4" x2="16" y2="6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="16" y1="25" x2="16" y2="30" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="14" y1="28" x2="14" y2="32" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/><line x1="18" y1="28" x2="18" y2="32" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/><circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.45"/></svg>`,
  "Hue": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="18" width="26" height="10" rx="1" fill="currentColor" opacity="0.15"/><rect x="3" y="18" width="26" height="10" rx="1" stroke="currentColor" stroke-width="1.8"/><path d="M8 28 L8 22 Q11 18 14 22 L14 28" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M18 28 L18 22 Q21 18 24 22 L24 28" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M1 18 L16 7 L31 18Z" fill="currentColor" opacity="0.2"/><path d="M1 18 L16 7 L31 18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 18 L16 11 L28 18" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity="0.6"/><line x1="16" y1="7" x2="16" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="22" r="2.5" stroke="currentColor" stroke-width="1.2"/></svg>`,
  "Kon Tum": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="16" x2="8" y2="30" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="24" y1="16" x2="24" y2="30" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="14" width="20" height="8" rx="1" fill="currentColor" opacity="0.15"/><rect x="6" y="14" width="20" height="8" rx="1" stroke="currentColor" stroke-width="1.8"/><path d="M2 14 L16 2 L30 14Z" fill="currentColor" opacity="0.18"/><path d="M2 14 L16 2 L30 14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="16" y1="2" x2="16" y2="0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="4" y1="30" x2="28" y2="30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="22" x2="14" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="24" y1="22" x2="18" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.5"/></svg>`,
  "Quy Nhon": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="18" width="12" height="12" rx="1" fill="currentColor" opacity="0.15"/><rect x="10" y="18" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="8" y="12" width="16" height="7" rx="1" fill="currentColor" opacity="0.12"/><rect x="8" y="12" width="16" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="10" y="7" width="12" height="6" rx="1" fill="currentColor" opacity="0.1"/><rect x="10" y="7" width="12" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><path d="M14 7 L16 2 L18 7Z" fill="currentColor"/><circle cx="16" cy="22" r="1.5" fill="currentColor" opacity="0.6"/><path d="M14 30 L14 24 Q16 22 18 24 L18 30" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>`,
  "Quang Binh": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 30 Q4 16 10 11 Q16 6 22 11 Q28 16 28 30Z" fill="currentColor" opacity="0.1"/><path d="M4 30 Q4 16 10 11 Q16 6 22 11 Q28 16 28 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 13 L10 18 L12 18Z" fill="currentColor" opacity="0.65"/><path d="M16 9 L15 15 L17 15Z" fill="currentColor" opacity="0.65"/><path d="M21 13 L20 18 L22 18Z" fill="currentColor" opacity="0.65"/><path d="M6 27 Q11 24 16 26 Q21 28 26 24 L26 30 L6 30Z" fill="currentColor" opacity="0.18"/><path d="M6 26 Q11 23 16 25 Q21 27 26 23" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/><circle cx="16" cy="21" r="1.2" fill="currentColor" opacity="0.8"/></svg>`,
  "Ho Chi Minh City": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="8" width="6" height="22" rx="1" fill="currentColor" opacity="0.15"/><rect x="13" y="8" width="6" height="22" rx="1" stroke="currentColor" stroke-width="1.8"/><ellipse cx="16" cy="14" rx="8" ry="3" fill="currentColor" opacity="0.12"/><ellipse cx="16" cy="14" rx="8" ry="3" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="14" r="2" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="16" y1="8" x2="16" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="2.5" r="1.2" fill="currentColor"/><rect x="4" y="20" width="5" height="10" rx="0.5" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.5"/><rect x="23" y="17" width="5" height="13" rx="0.5" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.5"/><rect x="14.5" y="18" width="1.5" height="1.5" fill="currentColor" opacity="0.5"/><rect x="14.5" y="21" width="1.5" height="1.5" fill="currentColor" opacity="0.5"/></svg>`,
  "Thailand": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2 L18 10 L20 12 L18 13 L19 18 L21 20 L19 21 L20 28 L12 28 L13 21 L11 20 L13 18 L14 13 L12 12 L14 10Z" fill="currentColor" opacity="0.18"/><path d="M16 2 L18 10 L20 12 L18 13 L19 18 L21 20 L19 21 L20 28 L12 28 L13 21 L11 20 L13 18 L14 13 L12 12 L14 10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><line x1="13" y1="10" x2="19" y2="10" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><line x1="13" y1="18" x2="19" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><line x1="11" y1="20" x2="21" y2="20" stroke="currentColor" stroke-width="1.2" opacity="0.7"/><rect x="8" y="28" width="16" height="3" rx="1" fill="currentColor" opacity="0.3"/><rect x="8" y="28" width="16" height="3" rx="1" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="2" r="1.5" fill="currentColor"/></svg>`,
  "China": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 28 L10 22 L6 22 L8 18 L6 18 L9 14 L7 14 L16 5 L25 14 L23 14 L26 18 L24 18 L26 22 L22 22 L22 28Z" fill="currentColor" opacity="0.12"/><path d="M10 28 L10 22 L6 22 L8 18 L6 18 L9 14 L7 14 L16 5 L25 14 L23 14 L26 18 L24 18 L26 22 L22 22 L22 28" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 28 L14 23 Q16 21 18 23 L18 28" stroke="currentColor" stroke-width="1.3" fill="none"/><circle cx="11" cy="19" r="1.2" fill="currentColor" opacity="0.6"/><circle cx="21" cy="19" r="1.2" fill="currentColor" opacity="0.6"/><line x1="16" y1="5" x2="16" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="1.5" r="1.2" fill="currentColor"/></svg>`,
  "Hanoi": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="28" rx="12" ry="2.5" fill="currentColor" opacity="0.12"/><path d="M4 28 Q10 25 16 27 Q22 25 28 28" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.5"/><ellipse cx="16" cy="24.5" rx="5" ry="2" fill="currentColor" opacity="0.2"/><ellipse cx="16" cy="24.5" rx="5" ry="2" stroke="currentColor" stroke-width="1.4"/><rect x="12" y="16" width="8" height="9" rx="0.5" fill="currentColor" opacity="0.15"/><rect x="12" y="16" width="8" height="9" rx="0.5" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="10" width="6" height="7" rx="0.5" fill="currentColor" opacity="0.12"/><rect x="13" y="10" width="6" height="7" rx="0.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 10 L16 5 L21 10Z" fill="currentColor" opacity="0.2"/><path d="M11 10 L16 5 L21 10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><line x1="16" y1="5" x2="16" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 2 L20 3.5 L16 5Z" fill="currentColor"/></svg>`,
  "Phu Tho": `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="10" rx="10" ry="4" stroke="currentColor" stroke-width="2"/><ellipse cx="16" cy="10" rx="6" ry="2.2" fill="currentColor" opacity="0.3"/><circle cx="16" cy="10" r="2" fill="currentColor"/><path d="M6 10 L4 22 Q16 26 28 22 L26 10" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="16" cy="22" rx="10" ry="3.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 14 Q16 16 24 14" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><path d="M7 18 Q16 20 25 18" stroke="currentColor" stroke-width="1.2" opacity="0.6"/><line x1="4" y1="22" x2="2" y2="28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="28" y1="22" x2="30" y2="28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="2" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};
function getCityIcon(name) {
  return cityIcons[name] || cityIcons["Hanoi"];
}

globe
  .htmlElementsData(cities)
  .htmlElement(city => {
    const el = document.createElement('div');
    el.className = 'globe-pin-wrapper';
    const delay = (Math.random() * 2).toFixed(2);
    const dur   = (2.8 + Math.random() * 0.8).toFixed(2);
    el.innerHTML = `
      <div class="globe-pin" style="--float-delay:${delay}s;--float-dur:${dur}s">
        <div class="globe-pin-card">
          <div class="globe-pin-glow"></div>
          <div class="globe-pin-icon">${getCityIcon(city.name)}</div>
        </div>
        <div class="globe-pin-stem"></div>
        <div class="globe-pin-base"></div>
        <div class="globe-pin-label">${city.name}</div>
      </div>
    `;
    el.style.cursor = 'pointer';
    el.style.pointerEvents = 'auto';
    el.addEventListener('click', () => openCity(city));
    return el;
  });

document.getElementById('enterBtn').addEventListener('click', () => {
  const hero = document.getElementById('hero');
  hero.style.opacity = '0';
  setTimeout(() => { hero.style.display = 'none'; }, 600);
  const { lat, lng } = cities[0];
  globe.pointOfView({ lat, lng, altitude: 1.4 }, 1600);
  globe.controls().autoRotate = false;
});

async function fetchPlaceMeta(place) {
  if (place._data) return place._data;
  try {
    const res = await fetch(blobUrl(place.metaBlobId));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    json.imageUrls = json.images.map(id => blobUrl(id));
    place._data = json;
    return json;
  } catch (err) {
    console.error(`Failed fetching blob ${place.metaBlobId}:`, err);
    return null;
  }
}

async function fetchCityPlaces(city) {
  return Promise.all(city.places.map(p => fetchPlaceMeta(p)));
}

async function openCity(city) {
  await loadMapLibs();
  activeCity = city;

  const overlay = document.getElementById('cinematic-overlay');
  const nameEl  = document.getElementById('cinematic-name');
  const coordEl = document.getElementById('cinematic-coords');

  nameEl.textContent  = city.name;
  coordEl.textContent = `${Math.abs(city.lat).toFixed(4)}° ${city.lat >= 0 ? 'N' : 'S'}   ${Math.abs(city.lng).toFixed(4)}° ${city.lng >= 0 ? 'E' : 'W'}`;

  overlay.style.transition = 'none';
  overlay.style.opacity    = '0';
  overlay.style.display    = 'flex';
  void overlay.offsetWidth;
  overlay.style.transition = 'opacity 0.5s ease';
  overlay.style.opacity    = '1';

  globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 0.6 }, 1200);
  globe.controls().autoRotate = false;

  const globeEl = document.getElementById('globeViz');
  globeEl.style.transition = 'opacity 0.8s ease';
  globeEl.style.opacity    = '0.15';

  setTimeout(async () => {
    document.getElementById('mapView').style.display = 'block';

    if (map) { map.remove(); map = null; }
    swiperInstances = {};
    allMarkerLayers = [];

    document.getElementById('sidebarContent').innerHTML = '';

    map = L.map('map', { zoomControl: false, fadeAnimation: false, zoomAnimation: false })
             .setView([city.lat, city.lng], 11);

    satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri, Maxar', maxZoom: 19 }
    );
    streetLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }
    );

    /* Start on satellite for cinematic feel */
    satelliteLayer.addTo(map);

    /* Dark label overlay for readability */
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 50);

    /* Smooth cinematic fly-in from above */
    map.setZoom(5);
    map.flyTo([city.lat, city.lng], 14, {
      animate: true,
      duration: 2.2,
      easeLinearity: 0.08,
    });

    markerCluster = L.markerClusterGroup({ maxClusterRadius: 60 });
    map.addLayer(markerCluster);

    /* Load places in background */
    const placeDataList = await fetchCityPlaces(city);
    renderSidebar(city, placeDataList);
    addMarkers(city, placeDataList);

  }, 400);

  /* --- Phase 3: reveal map, slide in UI --- */
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.9s ease';
    overlay.style.opacity    = '0';

    globeEl.style.transition = 'opacity 0.5s ease';
    globeEl.style.opacity    = '0';

    setTimeout(() => {
      overlay.style.display = 'none';
      globeEl.style.display = 'none';
      globeEl.style.opacity = '1'; /* reset for goBack */

      document.getElementById('backBtn').style.display = 'flex';
      document.getElementById('zoomControls').style.display = 'flex';

      const sidebar = document.getElementById('sidebar');
      sidebar.style.display = 'flex';
      requestAnimationFrame(() => requestAnimationFrame(() => sidebar.classList.add('show')));

    }, 900);
  }, 2200);
}

function addMarkers(city, placeDataList) {
  city.places.forEach((place, i) => {
    const data = placeDataList[i];
    if (!data) return;

    const thumbUrl = data.imageUrls[0];
    const uid = `place-${i}`;

    const icon = L.divIcon({
      html: `
        <div class="travel-marker" data-uid="${uid}">
          <div class="travel-marker-photo">
            <img src="${thumbUrl}" loading="lazy" alt="${data.name}"/>
          </div>
          <div class="travel-marker-pin"></div>
        </div>
      `,
      iconSize: [64, 80],
      iconAnchor: [32, 80],
      className: '',
    });

    const slidesHTML = data.imageUrls.map((url, si) => `
      <div class="swiper-slide">
        <a href="${url}" class="glb-${uid}" data-type="image" data-index="${si}">
          <img src="${url}" loading="lazy" alt="${data.name} photo ${si + 1}">
        </a>
      </div>
    `).join('');

    const starsHTML = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);

    // Format story paragraphs
    const storyParagraphs = (data.story || '')
      .split(/\n+/)
      .filter(p => p.trim())
      .map(p => `<p>${p.trim()}</p>`)
      .join('');

    const marker = L.marker([place.lat, place.lng], { icon });

    marker.bindPopup(`
      <div class="popup-inner">
        <div class="swiper swiper-${uid}">
          <div class="swiper-wrapper">${slidesHTML}</div>
          ${data.imageUrls.length > 1 ? `
            <div class="swiper-button-prev popup-swiper-prev"></div>
            <div class="swiper-button-next popup-swiper-next"></div>
          ` : ''}
          <div class="popup-photo-count">${data.imageUrls.length > 1 ? `${data.imageUrls.length} photos` : ''}</div>
        </div>
        <div class="popup-body">
          <div class="popup-title-row">
            <h2>${data.name}</h2>
          </div>
          <div class="popup-meta">
            <div class="popup-meta-chip">
              <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.2"/><path d="M4 1v2M8 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              ${data.date}
            </div>
            <div class="popup-meta-chip popup-stars-chip">
              <span class="popup-stars">${starsHTML}</span>
            </div>
          </div>
          <div class="popup-story-wrap">
            <div class="popup-story-icon">
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4h10M3 7h10M3 10h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </div>
            <div class="popup-story">${storyParagraphs || data.story}</div>
          </div>
        </div>
      </div>
    `, {
      maxWidth: 320,
      minWidth: 300,
      className: 'travel-popup',
      autoPanPadding: [20, 20]
    });

    marker.on('popupopen', () => {
      if (!swiperInstances[uid]) {
        setTimeout(() => {
          swiperInstances[uid] = new Swiper(`.swiper-${uid}`, {
            loop: data.imageUrls.length > 1,
            speed: 500,
            navigation: {
              prevEl: `.swiper-${uid} .popup-swiper-prev`,
              nextEl: `.swiper-${uid} .popup-swiper-next`,
            },
          });
        }, 80);
      }
      GLightbox({ selector: `.glb-${uid}`, loop: true });
      document.querySelectorAll('.travel-marker').forEach(el => el.classList.remove('active'));
      const el = document.querySelector(`.travel-marker[data-uid="${uid}"]`);
      if (el) el.classList.add('active');
      highlightCard(i);
    });

    marker.on('popupclose', () => {
      const el = document.querySelector(`.travel-marker[data-uid="${uid}"]`);
      if (el) el.classList.remove('active');
    });

    markerCluster.addLayer(marker);
    allMarkerLayers.push(marker);
  });
}

function renderSidebar(city, placeDataList) {
  const content = document.getElementById('sidebarContent');

  const cardsHTML = city.places.map((place, i) => {
    const data = placeDataList[i];
    if (!data) return `<div class="place-card-error">Could not load this place.</div>`;
    return `
      <div class="place-card" onclick="focusPlace(${i})" role="button" tabindex="0" aria-label="Go to ${data.name}">
        <div class="place-img-wrap">
          <img src="${data.imageUrls[0]}" class="place-img" loading="lazy" alt="${data.name}"/>
        </div>
        <div class="place-info">
          <span class="place-name">${data.name}</span>
          <span class="place-date">${data.date}</span>
          <span class="place-stars">${'★'.repeat(data.rating)}</span>
        </div>
        <div class="place-arrow">›</div>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="sidebar-header">${city.name}</div>
    <div class="sidebar-hint">Tap a place to explore</div>
    ${cardsHTML}
  `;

  content.querySelectorAll('.place-card').forEach((card, i) => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') focusPlace(i);
    });
  });
}

function focusPlace(i) {
  const layer = allMarkerLayers[i];
  if (!layer) return;
  map.setView(layer.getLatLng(), 17, { animate: true, duration: 1 });
  setTimeout(() => layer.openPopup(), 700);
  highlightCard(i);
}

function highlightCard(i) {
  document.querySelectorAll('.place-card').forEach((el, idx) => {
    el.classList.toggle('active', idx === i);
  });
  const cards = document.querySelectorAll('.place-card');
  if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('backBtn').addEventListener('click', goBack);

function goBack() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('show');
  setTimeout(() => { sidebar.style.display = 'none'; }, 400);

  document.getElementById('mapView').style.display = 'none';
  document.getElementById('backBtn').style.display  = 'none';
  document.getElementById('zoomControls').style.display = 'none';

  /* Restore globe */
  const globeEl = document.getElementById('globeViz');
  globeEl.style.display    = 'block';
  globeEl.style.transition = 'opacity 0.8s ease';
  globeEl.style.opacity    = '1';

  const hero = document.getElementById('hero');
  hero.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => { hero.style.opacity = '1'; }));

  globe.pointOfView({ lat: 20, lng: 100, altitude: 2.5 }, 1200);
  globe.controls().autoRotate = true;
  activeCity = null;
}

/* Custom zoom controls */
document.getElementById('zoomIn').addEventListener('click',  () => map && map.zoomIn());
document.getElementById('zoomOut').addEventListener('click', () => map && map.zoomOut());

const sidebarEl = document.getElementById('sidebar');
sidebarEl.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
sidebarEl.addEventListener('touchmove',  e => {
  if (e.touches[0].clientY - touchStartY > 70) sidebarEl.classList.remove('show');
}, { passive: true });

window.addEventListener('resize', () => {
  globe.width(window.innerWidth).height(window.innerHeight);
  if (map) setTimeout(() => map.invalidateSize(), 200);
});
