const setInner = (id, content) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = content;
};

const showMapMessage = (message) => {
  const element = document.getElementById("map-message");
  element.textContent = message;
  element.hidden = false;
};

if (!window.L) {
  showMapMessage("Library peta gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.");
} else {
  // Inisialisasi Peta Leaflet
  const map = L.map('map').setView([-6.8975, 107.5932], 13);

  const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: Esri, HERE, Garmin, OpenStreetMap contributors, and the GIS user community'
  }).addTo(map);

  tileLayer.on('tileerror', () => {
    showMapMessage("Peta dasar tidak bisa diakses dari jaringan ini. Periksa koneksi internet atau coba jaringan lain.");
  });

  const pointLayer = L.geoJSON(window.geojsonData, {
    style: (feature) => {
      if (feature.properties.tipe === 'route') {
        return {
          color: '#00aa13',
          weight: 6,
          opacity: 0.95
        };
      }
    },
    pointToLayer: (feature, latlng) => {
      const isStart = feature.properties.tipe === 'start';
      return L.circleMarker(latlng, {
        radius: 9,
        fillColor: isStart ? '#2563eb' : '#dc2626',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).bindPopup(feature.properties.nama_jalan);
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;

      // Menambah efek interaktif saat elemen peta diklik
      layer.on('click', () => {
        if (props.tipe === 'route') {
          setInner('val-note', '📍 Fokus: <b>Garis lurus dari Asia Afrika ke kampus ULBI</b>');
        } else {
          const location = props.tipe === 'start' ? 'Titik awal: Asia Afrika' : 'Titik tujuan: kampus ULBI';
          setInner('val-note', `📍 Fokus: <b>${location}</b>`);
        }
      });
    }
  }).addTo(map);

  map.fitBounds(pointLayer.getBounds(), { padding: [60, 60] });
  const start = window.geojsonData.features.find((feature) => feature.properties.tipe === 'start');
  const destination = window.geojsonData.features.find((feature) => feature.properties.tipe === 'end');
  const [startLongitude, startLatitude] = start.geometry.coordinates;
  const [destinationLongitude, destinationLatitude] = destination.geometry.coordinates;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDifference = toRadians(destinationLatitude - startLatitude);
  const longitudeDifference = toRadians(destinationLongitude - startLongitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(startLatitude)) * Math.cos(toRadians(destinationLatitude))
    * Math.sin(longitudeDifference / 2) ** 2;
  const straightDistance = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  setInner('val-jarak', `${straightDistance.toFixed(1)} km`);
  setInner('val-note', '💡 Garis ditampilkan lurus; estimasi waktu berkendara dihitung mengikuti jalan.');

  const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startLongitude},${startLatitude};${destinationLongitude},${destinationLatitude}?overview=false`;
  fetch(routeUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Layanan estimasi waktu merespons ${response.status}.`);
      }
      return response.json();
    })
    .then((result) => {
      const route = result.routes?.[0];
      if (result.code !== 'Ok' || !route) {
        throw new Error('Estimasi waktu berkendara tidak ditemukan.');
      }

      setInner('val-waktu', `~${Math.max(1, Math.round(route.duration / 60))} menit`);
    })
    .catch((error) => {
      console.error('Gagal menghitung estimasi waktu:', error);
      setInner('val-waktu', 'Tidak tersedia');
    });
}