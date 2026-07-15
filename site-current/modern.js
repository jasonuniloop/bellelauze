const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
});

nav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !nav.contains(link)) return;
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Ouvrir le menu");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelectorAll("[data-story-carousel]").forEach((carousel, carouselIndex) => {
  const slides = Array.from(carousel.querySelectorAll("img"));
  if (slides.length < 2) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  window.setInterval(() => {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }, 4200 + carouselIndex * 650);
});

document.querySelectorAll("[data-photo-carousel]").forEach((carousel) => {
  const main = carousel.querySelector("[data-carousel-main]");
  const title = carousel.querySelector("[data-carousel-title]");
  const kicker = carousel.querySelector("[data-carousel-kicker]");
  const frame = carousel.querySelector(".photo-frame");
  const thumbs = Array.from(carousel.querySelectorAll(".photo-thumbs button"));
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  if (!main || !title || !kicker || thumbs.length < 2) return;

  let activeIndex = thumbs.findIndex((thumb) => thumb.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  function showPhoto(index) {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[activeIndex];
    frame?.classList.add("is-changing");

    window.setTimeout(() => {
      main.src = thumb.dataset.src;
      main.alt = thumb.dataset.title || "Photo du Domaine Bellelauze";
      title.textContent = thumb.dataset.title || "";
      kicker.textContent = thumb.dataset.kicker || "Bellelauze";
      thumbs.forEach((item) => item.classList.toggle("is-active", item === thumb));
      frame?.classList.remove("is-changing");
    }, 160);
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => showPhoto(index));
  });

  prev?.addEventListener("click", () => showPhoto(activeIndex - 1));
  next?.addEventListener("click", () => showPhoto(activeIndex + 1));

  window.setInterval(() => {
    if (document.hidden) return;
    showPhoto(activeIndex + 1);
  }, 6200);
});

document.querySelectorAll(".photo-masonry").forEach((gallery) => {
  const figures = Array.from(gallery.querySelectorAll("figure"));
  if (!figures.length) return;

  const photos = figures.map((figure) => {
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    return {
      alt: image?.alt || "Photo du Domaine Bellelauze",
      caption: caption?.textContent.trim() || "Domaine Bellelauze",
      src: image?.getAttribute("src") || "",
    };
  });

  const lightbox = document.createElement("div");
  lightbox.className = "photo-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Photo agrandie");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Fermer la photo">×</button>
    <button class="lightbox-nav prev" type="button" aria-label="Photo précédente">‹</button>
    <div class="lightbox-stage">
      <img src="" alt="">
    </div>
    <button class="lightbox-nav next" type="button" aria-label="Photo suivante">›</button>
    <div class="lightbox-caption">
      <strong></strong>
      <span class="lightbox-count"></span>
    </div>
  `;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lightbox-caption strong");
  const count = lightbox.querySelector(".lightbox-count");
  const close = lightbox.querySelector(".lightbox-close");
  const prev = lightbox.querySelector(".lightbox-nav.prev");
  const next = lightbox.querySelector(".lightbox-nav.next");
  let activeIndex = 0;

  function renderPhoto() {
    const photo = photos[activeIndex];
    image.src = photo.src;
    image.alt = photo.alt;
    caption.textContent = photo.caption;
    count.textContent = `${activeIndex + 1} / ${photos.length}`;
  }

  function openLightbox(index) {
    activeIndex = index;
    renderPhoto();
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    close.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  function showRelativePhoto(offset) {
    activeIndex = (activeIndex + offset + photos.length) % photos.length;
    renderPhoto();
  }

  figures.forEach((figure, index) => {
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Agrandir la photo ${photos[index].caption}`);
    figure.addEventListener("click", () => openLightbox(index));
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openLightbox(index);
    });
  });

  close.addEventListener("click", closeLightbox);
  prev.addEventListener("click", () => showRelativePhoto(-1));
  next.addEventListener("click", () => showRelativePhoto(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showRelativePhoto(-1);
    if (event.key === "ArrowRight") showRelativePhoto(1);
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!form.reportValidity()) return;

    event.preventDefault();
    const data = new FormData(form);
    const lines = [
      "Nouvelle demande depuis le site Bellelauze",
      "",
      `Nom: ${data.get("Nom") || ""}`,
      `Email: ${data.get("Email") || ""}`,
      `Telephone: ${data.get("Telephone") || ""}`,
      `Dates souhaitees: ${data.get("Dates") || ""}`,
      "",
      "Message:",
      data.get("Message") || "",
    ];
    const subject = encodeURIComponent("Demande de sejour Bellelauze");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:info@bellelauze.com?subject=${subject}&body=${body}`;
  });
});

const mapCopy = {
  bellelauze: {
    title: "Domaine Bellelauze",
    text: "Votre point de départ au calme, entre Limoux, Carcassonne et les paysages cathares.",
  },
  carcassonne: {
    title: "Carcassonne",
    text: "La cité médiévale, ses remparts et ses ruelles se découvrent facilement depuis le domaine.",
  },
  chateaux: {
    title: "Châteaux cathares",
    text: "Des forteresses perchées, des abbayes et des panoramas pour ressentir l'histoire du Pays cathare.",
  },
  limoux: {
    title: "Limoux & l'Aude",
    text: "Marchés, rivière, vignobles et petites routes composent une escapade douce autour de Bellelauze.",
  },
  rennes: {
    title: "Rennes-le-Château",
    text: "Un village perché, mystérieux et singulier, idéal pour une demi-journée dans la Haute Vallée.",
  },
  vignes: {
    title: "Vignes & terroir",
    text: "Les vignes, les marchés et les produits locaux donnent au séjour son accent audois.",
  },
};

const mapPins = document.querySelectorAll("[data-map-point]");
const mapCards = document.querySelectorAll("[data-map-card]");
const mapCaption = document.querySelector("[data-map-caption]");

function activateMapPoint(id) {
  mapPins.forEach((pin) => pin.classList.toggle("is-active", pin.dataset.mapPoint === id));
  mapCards.forEach((card) => card.classList.toggle("is-active", card.dataset.mapCard === id));

  if (mapCaption && mapCopy[id]) {
    mapCaption.querySelector("strong").textContent = mapCopy[id].title;
    mapCaption.querySelector("span").textContent = mapCopy[id].text;
  }
}

mapPins.forEach((pin) => {
  pin.addEventListener("click", () => activateMapPoint(pin.dataset.mapPoint));
  pin.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateMapPoint(pin.dataset.mapPoint);
  });
});

mapCards.forEach((card) => {
  card.addEventListener("click", () => activateMapPoint(card.dataset.mapCard));
  card.addEventListener("mouseenter", () => activateMapPoint(card.dataset.mapCard));
  card.addEventListener("focusin", () => activateMapPoint(card.dataset.mapCard));
});

const tourismPlaces = [
  {
    id: "bellelauze",
    name: "Domaine Bellelauze",
    type: "home",
    icon: "B",
    coords: [42.99, 2.16],
    description: "Votre point de départ à Bouriège pour explorer l'Aude, Limoux, Carcassonne et le Pays cathare.",
    officialUrl: "https://www.bellelauze.com/",
  },
  {
    id: "carcassonne",
    name: "Cité de Carcassonne",
    type: "city",
    icon: "C",
    coords: [43.206, 2.364],
    description: "Remparts, château comtal et ruelles médiévales, l'incontournable grand site de l'Aude.",
    officialUrl: "https://www.remparts-carcassonne.fr/",
  },
  {
    id: "limoux",
    name: "Limoux",
    type: "city",
    icon: "L",
    coords: [43.054, 2.218],
    description: "Ville de marchés, de carnaval, de Blanquette et de balades au bord de l'Aude.",
    officialUrl: "https://www.limouxin-tourisme.com/",
  },
  {
    id: "rennes",
    name: "Rennes-le-Château",
    type: "heritage",
    icon: "R",
    coords: [42.928, 2.263],
    description: "Village perché de la Haute Vallée, connu pour son histoire mystérieuse et ses panoramas.",
    officialUrl: "https://www.rennes-le-chateau.fr/",
  },
  {
    id: "alet",
    name: "Alet-les-Bains",
    type: "heritage",
    icon: "A",
    coords: [42.997, 2.256],
    description: "Ancienne cité thermale, abbaye en ruines et ruelles paisibles au bord de l'Aude.",
    officialUrl: "https://www.limouxin-tourisme.com/",
  },
  {
    id: "saint-hilaire",
    name: "Abbaye de Saint-Hilaire",
    type: "heritage",
    icon: "H",
    coords: [43.093, 2.309],
    description: "Abbaye bénédictine réputée, liée à l'histoire de la Blanquette de Limoux.",
    officialUrl: "https://www.abbayedesainthilaire.com/",
  },
  {
    id: "lagrasse",
    name: "Lagrasse",
    type: "heritage",
    icon: "L",
    coords: [43.091, 2.618],
    description: "Village classé des Corbières, abbaye, pont médiéval et ruelles de pierre.",
    officialUrl: "https://www.lagrasse.com/",
  },
  {
    id: "fontfroide",
    name: "Abbaye de Fontfroide",
    type: "heritage",
    icon: "F",
    coords: [43.13, 2.897],
    description: "Grande abbaye cistercienne près de Narbonne, jardins, cloître et pierre dorée.",
    officialUrl: "https://www.fontfroide.com/",
  },
  {
    id: "narbonne",
    name: "Narbonne",
    type: "city",
    icon: "N",
    coords: [43.184, 3.004],
    description: "Ville romaine et méditerranéenne, halles, cathédrale et canal de la Robine.",
    officialUrl: "https://www.narbonne-tourisme.com/",
  },
  {
    id: "canal-midi",
    name: "Canal du Midi à Trèbes",
    type: "heritage",
    icon: "M",
    coords: [43.21, 2.441],
    description: "Balade au bord de l'eau, écluses et atmosphère douce du Canal du Midi.",
    officialUrl: "https://www.tourisme-carcassonne.fr/",
  },
  {
    id: "lastours",
    name: "Châteaux de Lastours",
    type: "castle",
    icon: "♜",
    coords: [43.335, 2.379],
    description: "Quatre châteaux perchés au-dessus de la vallée de l'Orbiel.",
    officialUrl: "https://chateaux-de-lastours.fr/",
  },
  {
    id: "arques",
    name: "Château d'Arques",
    type: "castle",
    icon: "♜",
    coords: [42.953, 2.379],
    description: "Donjon élégant et paysage de bois au coeur du Razès.",
    officialUrl: "https://www.chateau-arques.fr/",
  },
  {
    id: "termes",
    name: "Château de Termes",
    type: "castle",
    icon: "♜",
    coords: [43.001, 2.561],
    description: "Site cathare sauvage, gorges et reliefs des Hautes Corbières.",
    officialUrl: "https://www.chateau-termes.com/",
  },
  {
    id: "queribus",
    name: "Château de Quéribus",
    type: "castle",
    icon: "♜",
    coords: [42.837, 2.621],
    description: "Forteresse vertigineuse et vue spectaculaire sur les Corbières.",
    officialUrl: "https://www.chateau-queribus.fr/",
  },
  {
    id: "peyrepertuse",
    name: "Château de Peyrepertuse",
    type: "castle",
    icon: "♜",
    coords: [42.871, 2.556],
    description: "L'un des grands châteaux cathares, perché sur une crête calcaire.",
    officialUrl: "https://www.peyrepertuse.com/",
  },
  {
    id: "puivert",
    name: "Château de Puivert",
    type: "castle",
    icon: "♜",
    coords: [42.922, 2.048],
    description: "Château des troubadours, au pied des reliefs du Quercorb.",
    officialUrl: "http://www.chateau-de-puivert.com/",
  },
  {
    id: "puilaurens",
    name: "Château de Puilaurens",
    type: "castle",
    icon: "♜",
    coords: [42.803, 2.299],
    description: "Citadelle perchée dans un décor de montagne et de forêt.",
    officialUrl: "https://www.chateau-puilaurens.com/",
  },
  {
    id: "galamus",
    name: "Gorges de Galamus",
    type: "nature",
    icon: "G",
    coords: [42.835, 2.481],
    description: "Route spectaculaire, falaises, ermitage et eaux claires.",
    officialUrl: "https://www.gorgesdegalamus.fr/",
  },
  {
    id: "cabrespine",
    name: "Gouffre géant de Cabrespine",
    type: "nature",
    icon: "G",
    coords: [43.36, 2.465],
    description: "Immense cavité naturelle, passerelles et fraîcheur souterraine.",
    officialUrl: "https://www.gouffre-de-cabrespine.com/",
  },
  {
    id: "bugarach",
    name: "Pic de Bugarach",
    type: "nature",
    icon: "B",
    coords: [42.875, 2.35],
    description: "Sommet emblématique des Corbières, apprécié des randonneurs.",
    officialUrl: "https://www.limouxin-tourisme.com/",
  },
  {
    id: "vignes-limoux",
    name: "Vignobles de Limoux",
    type: "wine",
    icon: "V",
    coords: [43.075, 2.2],
    description: "Paysages de vignes, domaines viticoles et terroir de la Blanquette.",
    officialUrl: "https://www.limoux-aoc.com/",
  },
  {
    id: "minervois",
    name: "Minerve & Minervois",
    type: "wine",
    icon: "V",
    coords: [43.354, 2.746],
    description: "Village perché, gorges et route des vins du Minervois.",
    officialUrl: "https://www.minerve-tourisme.fr/",
  },
];

function initTourismMap() {
  const mapElement = document.querySelector("#tourism-map");
  const listElement = document.querySelector("[data-tourism-list]");
  const panelElement = document.querySelector("[data-map-place-panel]");
  const filterButtons = document.querySelectorAll("[data-map-filter]");

  if (!mapElement || !listElement || !window.L) return;

  const typeLabels = {
    home: "Domaine",
    city: "Ville",
    castle: "Château",
    nature: "Nature",
    heritage: "Patrimoine",
    wine: "Terroir",
  };

  const map = L.map(mapElement, {
    scrollWheelZoom: false,
  }).setView([43.02, 2.32], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markers = new Map();
  const bounds = [];
  let activeFilter = "all";
  let activeId = "bellelauze";

  function typeIconSvg(type) {
    const icons = {
      home: '<path d="M5 18V9.5L12 4l7 5.5V18h-5v-5h-4v5H5Z" />',
      city: '<path d="M5 19V7h4V5h6v5h4v9H5Zm3-3h2v-2H8v2Zm0-5h2V9H8v2Zm6 5h2v-2h-2v2Zm0-5h2V9h-2v2Z" />',
      castle: '<path d="M4 19V7h3V5h3v2h4V5h3v2h3v12H4Zm4-3h8v-4H8v4Zm1-6h6V9H9v1Z" />',
      nature: '<path d="M12 20c4-3.2 7-7.3 7-11.1C19 5.6 16.4 3 13.1 3 8.8 3 5 6.7 5 11c0 3.9 3.1 6.9 7 9Zm0-4c-2.7-1.8-4-3.5-4-5 0-1.9 1.4-3.5 3.3-3.5 1.1 0 2 .5 2.7 1.4-.2 2.1-1 4.4-2 7.1Z" />',
      heritage: '<path d="M4 19h16v-2H4v2Zm2-4h12v-2H6v2Zm1-4h2V8h2v3h2V8h2v3h2V6L12 3 7 6v5Z" />',
      wine: '<path d="M10 20h4v-6c2.3-.8 4-3 4-5.6V4H6v4.4C6 11 7.7 13.2 10 14v6Zm-1-12h6v.4c0 1.8-1.3 3.3-3 3.6-1.7-.3-3-1.8-3-3.6V8Z" />',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.heritage}</svg>`;
  }

  function markerIcon(place) {
    const classes = `tourism-icon tourism-icon-${place.type} tourism-marker`;
    return L.divIcon({
      className: "",
      html: `<span class="${classes}">${typeIconSvg(place.type)}</span>`,
      iconSize: place.type === "home" ? [42, 42] : [34, 34],
      iconAnchor: place.type === "home" ? [21, 21] : [17, 17],
      popupAnchor: [0, -18],
    });
  }

  function popupHtml(place) {
    return `
      <article class="map-popup">
        <span class="map-popup-tag">${typeLabels[place.type] || "À découvrir"}</span>
        <strong>${place.name}</strong>
        <p>${place.description}</p>
        <a href="${place.officialUrl}" target="_blank" rel="noreferrer">Site officiel</a>
      </article>
    `;
  }

  function setPanel(place) {
    if (!panelElement) return;
    panelElement.querySelector("strong").textContent = place.name;
    panelElement.querySelector("span").textContent = place.description;
  }

  function matches(place) {
    return activeFilter === "all" || place.type === activeFilter || place.type === "home";
  }

  function selectPlace(id, shouldZoom = true) {
    const place = tourismPlaces.find((item) => item.id === id);
    if (!place) return;
    activeId = id;
    setPanel(place);
    listElement.querySelectorAll(".map-result").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.placeId === id);
    });
    const marker = markers.get(id);
    if (marker) {
      if (shouldZoom) map.flyTo(place.coords, place.type === "home" ? 11 : 12, { duration: 0.7 });
      marker.openPopup();
    }
  }

  function renderList() {
    const visiblePlaces = tourismPlaces.filter((place) => matches(place));
    listElement.innerHTML = visiblePlaces
      .map(
        (place) => `
          <article class="map-result ${place.id === activeId ? "is-active" : ""}" data-place-id="${place.id}">
            <button class="map-result-main" type="button">
              <span class="tourism-icon tourism-icon-${place.type} map-result-icon">${typeIconSvg(place.type)}</span>
              <span>
                <em>${typeLabels[place.type] || "À découvrir"}</em>
                <strong>${place.name}</strong>
                <span>${place.description}</span>
              </span>
            </button>
            <a class="map-result-link" href="${place.officialUrl}" target="_blank" rel="noreferrer">Site officiel</a>
          </article>
        `
      )
      .join("");

    listElement.querySelectorAll("[data-place-id]").forEach((button) => {
      button.querySelector(".map-result-main").addEventListener("click", () => selectPlace(button.dataset.placeId));
    });
  }

  tourismPlaces.forEach((place) => {
    const marker = L.marker(place.coords, { icon: markerIcon(place), title: place.name })
      .addTo(map)
      .bindPopup(popupHtml(place));
    marker.on("click", () => selectPlace(place.id, false));
    markers.set(place.id, marker);
    bounds.push(place.coords);
  });

  map.fitBounds(bounds, { padding: [34, 34] });
  setTimeout(() => map.invalidateSize(), 150);
  setTimeout(() => map.invalidateSize(), 700);
  window.addEventListener("resize", () => map.invalidateSize());

  const mapResizeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) map.invalidateSize();
    });
  });
  mapResizeObserver.observe(mapElement);

  renderList();
  setPanel(tourismPlaces[0]);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.mapFilter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      renderList();
    });
  });

  const featuredMapTargets = {
    bellelauze: "bellelauze",
    carcassonne: "carcassonne",
    chateaux: "peyrepertuse",
    limoux: "limoux",
    rennes: "rennes",
    vignes: "vignes-limoux",
  };

  document.querySelectorAll("[data-map-card]").forEach((card) => {
    const target = featuredMapTargets[card.dataset.mapCard];
    if (!target) return;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", () => selectPlace(target));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectPlace(target);
    });
  });
}

initTourismMap();
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
