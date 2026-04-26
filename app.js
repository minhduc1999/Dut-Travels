let map = null;
let markerCluster = null;
let activeCity = null;
let swiperInstances = {};
let touchStartY = 0;

const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .width(window.innerWidth)
  .height(window.innerHeight)
  .pointOfView({ lat: 20, lng: 100, altitude: 2.5 })
  .backgroundColor('rgba(0,0,0,0)');

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.07;

globe
  .htmlElementsData(cities)
  .htmlElement(city => {
    const el = document.createElement('div');
    el.innerHTML = `<div class="city-label">📍 ${city.name}</div>`;
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
  activeCity = city;

  document.getElementById('mapView').style.display = 'block';
  document.getElementById('backBtn').style.display = 'flex';

  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('sidebarContent');
  sidebar.style.display = 'flex';
  content.innerHTML = `
    <div class="sidebar-header">${city.name}</div>
    <div class="loading">Loading places…</div>
  `;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => sidebar.classList.add('show'));
  });

  if (map) { map.remove(); map = null; }
  swiperInstances = {};

  map = L.map('map', { zoomControl: true }).setView([city.lat, city.lng], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);
  setTimeout(() => map.invalidateSize(), 200);

  markerCluster = L.markerClusterGroup({ maxClusterRadius: 60 });
  map.addLayer(markerCluster);

  globe.pointOfView({ lat: city.lat, lng: city.lng, altitude: 1.5 }, 800);

  const placeDataList = await fetchCityPlaces(city);
  renderSidebar(city, placeDataList);
  addMarkers(city, placeDataList);
}

function addMarkers(city, placeDataList) {
  city.places.forEach((place, i) => {
    const data = placeDataList[i];
    if (!data) return;

    const thumbUrl = data.imageUrls[0];
    const uid = `place-${i}`;

    const icon = L.divIcon({
      html: `<div class="img-marker"><img src="${thumbUrl}" loading="lazy" alt="${data.name}"/></div>`,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
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

    const marker = L.marker([place.lat, place.lng], { icon });

    marker.bindPopup(`
      <div class="popup-inner">
        <div class="swiper swiper-${uid}">
          <div class="swiper-wrapper">${slidesHTML}</div>
        </div>
        <h2>${data.name}</h2>
        <div class="popup-meta">
          <div class="popup-row"><span class="popup-label">Date</span>${data.date}</div>
          <div class="popup-row"><span class="popup-label">Rating</span><span class="popup-stars">${starsHTML}</span></div>
          <div class="popup-row"><span class="popup-label">Story</span>${data.story}</div>
        </div>
      </div>
    `, { maxWidth: 270, minWidth: 250 });

    marker.on('popupopen', () => {
      if (!swiperInstances[uid]) {
        swiperInstances[uid] = new Swiper(`.swiper-${uid}`, {
          loop: data.imageUrls.length > 1,
          speed: 400,
        });
      }
      GLightbox({ selector: `.glb-${uid}`, loop: true });
      highlightCard(i);
    });

    markerCluster.addLayer(marker);
  });
}

function renderSidebar(city, placeDataList) {
  const content = document.getElementById('sidebarContent');

  const cardsHTML = city.places.map((place, i) => {
    const data = placeDataList[i];
    if (!data) {
      return `<div class="place-card-error">Could not load this place.</div>`;
    }

    return `
      <div class="place-card" onclick="focusPlace(${i})" role="button" tabindex="0" aria-label="Go to ${data.name}">
        <img src="${data.imageUrls[0]}" class="place-img" loading="lazy" alt="${data.name}"/>
        <div class="place-info">
          <span class="place-name">${data.name}</span>
          <span class="place-date">${data.date}</span>
          <span class="place-stars">${'★'.repeat(data.rating)}</span>
        </div>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="sidebar-header">${city.name}</div>
    ${cardsHTML}
  `;

  content.querySelectorAll('.place-card').forEach((card, i) => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') focusPlace(i);
    });
  });
}

function focusPlace(i) {
  const layers = markerCluster.getLayers();
  if (!layers[i]) return;
  map.setView(layers[i].getLatLng(), 15, { animate: true });
  setTimeout(() => layers[i].openPopup(), 300);
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
  document.getElementById('backBtn').style.display = 'none';

  const hero = document.getElementById('hero');
  hero.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { hero.style.opacity = '1'; });
  });

  globe.pointOfView({ lat: 20, lng: 100, altitude: 2.5 }, 1200);
  globe.controls().autoRotate = true;
  activeCity = null;
}

const sidebarEl = document.getElementById('sidebar');

sidebarEl.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

sidebarEl.addEventListener('touchmove', e => {
  const delta = e.touches[0].clientY - touchStartY;
  if (delta > 70) {
    sidebarEl.classList.remove('show');
  }
}, { passive: true });

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

window.addEventListener('resize', () => {
  globe.width(window.innerWidth).height(window.innerHeight);
  if (map) setTimeout(() => map.invalidateSize(), 200);
});
