let map;
let userMarker;
let placeMarkers = [];
let selectedLat, selectedLon;
let routeControl = null;
let selectedDestination = null;
let placesCache = [];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });
}

const icons = {
  hospital: createIcon("green"),
  atm: createIcon("violet"),
  restaurant: createIcon("orange"),
  mall: createIcon("blue"),
  hotel: createIcon("yellow")
};

navigator.geolocation.getCurrentPosition(pos => {
  selectedLat = pos.coords.latitude;
  selectedLon = pos.coords.longitude;

  map = L.map("map").setView([selectedLat, selectedLon], 14);

  setTimeout(() => map.invalidateSize(), 200);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  userMarker = L.marker([selectedLat, selectedLon], {
    draggable: true,
    icon: redIcon
  }).addTo(map);

  userMarker.on("dragend", e => {
    const p = e.target.getLatLng();
    selectedLat = p.lat;
    selectedLon = p.lng;

    updateDistancesInResults();
    refreshRouteAndETA();
  });
});


function findPlaces() {
  const category = document.getElementById("category").value;
  if (!category) return alert("Please select a category");

  placeMarkers.forEach(m => map.removeLayer(m));
  placeMarkers = [];
  placesCache = [];
  selectedDestination = null;

  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🔍 Searching nearby places...";

  const tag =
    category === "mall"
      ? `["shop"="mall"]`
      : category === "hotel"
      ? `["tourism"="hotel"]`
      : `["amenity"="${category}"]`;

  const query = `
    [out:json];
    (
      node${tag}(around:3000,${selectedLat},${selectedLon});
      way${tag}(around:3000,${selectedLat},${selectedLon});
      relation${tag}(around:3000,${selectedLat},${selectedLon});
    );
    out center;
  `;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(res => res.json())
    .then(data => {
      resultsDiv.innerHTML = "";
      if (!data.elements.length) {
        resultsDiv.innerHTML = "No nearby places found.";
        return;
      }

      data.elements.forEach(place => {
        const lat = place.lat || place.center.lat;
        const lon = place.lon || place.center.lon;

        const marker = L.marker([lat, lon], {
          icon: icons[category]
        }).addTo(map);

        placeMarkers.push(marker);

        const resultItem = document.createElement("div");
        resultItem.className = "result-item";

        const distanceSpan = document.createElement("div");
        distanceSpan.className = "result-distance";

        resultItem.innerHTML = `
          <div class="result-left">📍 ${place.tags.name || "Unnamed place"}</div>
        `;
        resultItem.appendChild(distanceSpan);

        resultItem.onclick = () => {
          document.querySelectorAll(".result-item")
            .forEach(el => el.classList.remove("active"));
          resultItem.classList.add("active");

          selectedDestination = {
            lat,
            lon,
            marker,
            name: place.tags.name || "Unnamed place"
          };

          drawRouteWithETA();
        };

        resultsDiv.appendChild(resultItem);

        placesCache.push({
          lat,
          lon,
          marker,
          name: place.tags.name || "Unnamed place",
          resultItem,
          distanceSpan
        });
      });

      updateDistancesInResults();
    });
}

function updateDistancesInResults() {
  placesCache.forEach(p => {
    p.distance = getDistance(selectedLat, selectedLon, p.lat, p.lon);
    p.distanceSpan.innerText = `${p.distance.toFixed(2)} km`;
  });

  placesCache.sort((a, b) => a.distance - b.distance);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  placesCache.forEach(p => resultsDiv.appendChild(p.resultItem));
}


function drawRouteWithETA() {
  if (!selectedDestination) return;

  if (routeControl) map.removeControl(routeControl);

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(selectedLat, selectedLon),
      L.latLng(selectedDestination.lat, selectedDestination.lon)
    ],
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1"
    }),
    addWaypoints: false,
    draggableWaypoints: false,
    show: false,
    createMarker: () => null
  })
    .on("routesfound", e => {
      const route = e.routes[0];
      const km = (route.summary.totalDistance / 1000).toFixed(2);
      const eta = Math.round(route.summary.totalTime / 60);

      selectedDestination.marker
        .bindPopup(
          `<strong>${selectedDestination.name}</strong><br>
           Distance: ${km} km<br>
           ETA: ${eta} mins`
        )
        .openPopup();
    })
    .addTo(map);
}


function refreshRouteAndETA() {
  if (selectedDestination) {
    drawRouteWithETA();
  }
}
