import { geojsonData } from "./config.js";

// Helper setInner dari Croot.js / Fallback
let setInner = (id, content) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = content;
};

try {
  const croot = await import("https://cdn.jsdelivr.net/gh/jualan/croot@0.0.1/croot.js");
  if (croot.setInner) setInner = croot.setInner;
} catch (e) {
  console.warn("Menggunakan fallback DOM lokal.");
}

// Inisialisasi Peta Leaflet
const map = L.map('map').setView([-6.9171, 107.6060], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap | Croot.js'
}).addTo(map);

// Render Layer GeoJSON
const geojsonLayer = L.geoJSON(geojsonData, {
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
    });
  },
  onEachFeature: (feature, layer) => {
    const props = feature.properties;

    // Menambah efek interaktif saat elemen peta diklik
    layer.on('click', () => {
      if (props.tipe === 'route') {
        setInner('val-note', `📍 Fokus: <b>Garis Rute Perjalanan Gojek</b>`);
      } else if (props.tipe === 'start') {
        setInner('val-note', `📍 Fokus: <b>Titik Awal (Penjemputan)</b>`);
      } else if (props.tipe === 'end') {
        setInner('val-note', `📍 Fokus: <b>Titik Tujuan (Pengantaran)</b>`);
      }
    });
  }
}).addTo(map);

// Otomatis pas batas peta ke rute
map.fitBounds(geojsonLayer.getBounds(), { padding: [60, 60] });