const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

globe.width(window.innerWidth);
globe.height(window.innerHeight);

globe.pointOfView({ lat: 20, lng: 100, altitude: 2.5 });

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.06;

// CITY MARKER
globe.htmlElementsData(cities)
.htmlElement(d => {
  const el = document.createElement("div");

  el.innerHTML = `
    <div style="color:white;background:rgba(0,0,0,.6);padding:6px 10px;border-radius:10px">
      📍 ${d.name}
    </div>
  `;

  el.style.cursor = "pointer";
  el.style.pointerEvents = "auto";

  el.onclick = () => openCity(d);

  return el;
});

// ENTER BUTTON
document.getElementById("enterBtn").onclick = () => {
  const hero = document.getElementById("hero");

  hero.style.opacity = 0;
  setTimeout(()=> hero.style.display = "none", 500);

  const firstCity = cities[0];

  globe.pointOfView(
    { lat: firstCity.lat, lng: firstCity.lng, altitude: 1.2 },
    1500
  );
};

// MAP
let map, markers;

function openCity(city){
  document.getElementById("mapView").style.display="block";
  document.getElementById("backBtn").style.display="block";

  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "block";

  setTimeout(()=> sidebar.classList.add("show"),50);

  if(map) map.remove();

  map = L.map('map').setView([city.lat, city.lng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  setTimeout(() => map.invalidateSize(), 200);

  markers = L.markerClusterGroup();

  renderSidebar(city);

  city.places.forEach((p,i)=>{
    const icon = L.divIcon({
      html:`<div class="img-marker"><img src="${p.images[0]}"/></div>`,
      iconSize:[60,60],
      iconAnchor:[30,30]
    });

    const m = L.marker([p.lat,p.lng],{icon});

    m.bindPopup(`
      <div style="width:240px">
        <div class="swiper s-${i}">
          <div class="swiper-wrapper">
            ${p.images.map(img=>`
              <div class="swiper-slide">
                <a href="${img}" class="g-${i}">
                  <img src="${img}">
                </a>
              </div>
            `).join("")}
          </div>
        </div>
        <h2>${p.name}</h2>
        <p style="color:green;"><span style="color:blue;">Date:</span> ${p.date}</p>
        <p style="color:yellow;"><span style="color:blue;">Star rating:</span> ${"★".repeat(p.rating)}</p>
        <p><span style="color:blue;">My travel experience:</span> ${p.story}</p>
      </div>
    `);

    m.on("popupopen",()=>{
      new Swiper(`.s-${i}`);
      GLightbox({selector:`.g-${i}`});
      highlight(i);
    });

    markers.addLayer(m);
  });

  map.addLayer(markers);
}

// SIDEBAR
function renderSidebar(city){
  const sb = document.getElementById("sidebar");

  sb.innerHTML = `<div class="sidebar-header">${city.name}</div>`;

  city.places.forEach((p,i)=>{
    sb.innerHTML += `
      <div class="place-card" onclick="focusPlace(${i})">
        <img src="${p.images[0]}" class="place-img"/>
        <div>
          <b>${p.name}</b><br/>
          ${p.date}<br/>
          <span class="stars">${"★".repeat(p.rating)}</span>
        </div>
      </div>
    `;
  });
}

function focusPlace(i){
  const m = markers.getLayers()[i];
  map.setView(m.getLatLng(),14);
  m.openPopup();
}

function highlight(i){
  document.querySelectorAll(".place-card").forEach(el=>el.classList.remove("active"));
  const el = document.querySelectorAll(".place-card")[i];
  if(el) el.classList.add("active");
}

// BACK
document.getElementById("backBtn").onclick = () => {
  const sidebar = document.getElementById("sidebar");

  sidebar.classList.remove("show");

  setTimeout(()=>{
    sidebar.style.display="none";
  },300);

  document.getElementById("mapView").style.display="none";
  document.getElementById("backBtn").style.display="none";

  const hero = document.getElementById("hero");
  hero.style.display = "block";
  setTimeout(()=> hero.style.opacity = 1, 50);

  globe.pointOfView({ lat: 20, lng: 100, altitude: 2.5 }, 1000);
};

// 👉 SWIPE DOWN TO CLOSE (mobile)
let startY = 0;
const sidebarEl = document.getElementById("sidebar");

sidebarEl.addEventListener("touchstart", e=>{
  startY = e.touches[0].clientY;
});

sidebarEl.addEventListener("touchmove", e=>{
  const diff = e.touches[0].clientY - startY;

  if(diff > 60){
    sidebarEl.classList.remove("show");
  }
});

// RESIZE
window.addEventListener("resize",()=>{
  globe.width(window.innerWidth);
  globe.height(window.innerHeight);

  if(map){
    setTimeout(()=>map.invalidateSize(),200);
  }
});

