import { createMap, addGeoJSON, fitMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/map.js";
import { findRoute } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/georoute.js";
import { onClick, setInner, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/element.js";

const MAP_ID = "map";
const DATA_URL = "./data.geojson";
let campusData = null;
let routeLayerRemove = null;
let campusLayerRemove = null;
let buildings = [];

const status = (message, type = "") => {
  const element = document.getElementById("status");
  element.textContent = message;
  element.className = `status ${type}`.trim();
};

function getFeatureName(feature, index) {
  const props = feature.properties || {};
  return props.Gedung || props.nama || props.name || props.Name || `Bangunan tanpa nama ${index + 1}`;
}

function polygonCenter(feature) {
  const geometry = feature.geometry;
  if (!geometry || geometry.type !== "Polygon" || !geometry.coordinates?.[0]?.length) return null;
  const ring = geometry.coordinates[0];
  // Rata-rata titik batas: cukup untuk menentukan titik awal/tujuan pada gedung kampus.
  const points = ring.slice(0, -1).length ? ring.slice(0, -1) : ring;
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

function populateLocations() {
  buildings = campusData.features
    .map((feature, index) => ({ feature, index, name: getFeatureName(feature, index), center: polygonCenter(feature) }))
    .filter(item => item.feature.geometry?.type === "Polygon" && item.center)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  for (const id of ["from", "to"]) {
    const select = document.getElementById(id);
    select.replaceChildren();
    buildings.forEach((building, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = building.name;
      select.append(option);
    });
  }

  const from = document.getElementById("from");
  const to = document.getElementById("to");
  if (buildings.length > 1) {
    from.value = "0";
    to.value = String(Math.min(1, buildings.length - 1));
  }
}

function drawCampus() {
  campusLayerRemove?.();
  campusLayerRemove = addGeoJSON(MAP_ID, campusData, {
    style: (feature) => {
      if (feature.geometry?.type === "Polygon" || feature.geometry?.type === "MultiPolygon") {
        const fill = feature.properties?.fill;
        return {
          fill: typeof fill === "string" && !fill.startsWith("rgba") ? fill : "#8bb8f2",
          fillOpacity: Number(feature.properties?.["fill-opacity"] ?? 0.72),
          stroke: "#405a7b",
          strokeWidth: 1.5
        };
      }
      if (feature.geometry?.type === "LineString" || feature.geometry?.type === "MultiLineString") {
        return { stroke: "#596579", strokeWidth: 4, strokeOpacity: 0.95 };
      }
      return null;
    },
    popup: (feature) => {
      const name = feature.properties?.Gedung || feature.properties?.nama || feature.properties?.name;
      if (name) return String(name);
      return feature.geometry?.type === "LineString" ? "Polyline jalan kampus" : null;
    }
  });
  fitMap(MAP_ID, campusData, 35);
}

function showRoute() {
  if (!campusData) return;
  const fromIndex = Number(getValue("from"));
  const toIndex = Number(getValue("to"));
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
    status("Pilih titik berangkat dan tujuan terlebih dahulu.", "error");
    return;
  }
  if (fromIndex === toIndex) {
    status("Titik berangkat dan tujuan tidak boleh sama.", "error");
    return;
  }

  const from = buildings[fromIndex];
  const to = buildings[toIndex];
  const route = findRoute(from.center, to.center, campusData, { precision: 4 });

  routeLayerRemove?.();
  routeLayerRemove = null;

  if (!route) {
    document.getElementById("routeInfo").hidden = true;
    status("Rute tidak ditemukan. Data saat ini mungkin hanya memiliki satu garis jalan atau polyline belum tersambung di persimpangan. Tambahkan garis jalan yang saling terhubung pada data.geojson.", "error");
    return;
  }

  routeLayerRemove = addGeoJSON(MAP_ID, route, {
    style: { stroke: "#e53e3e", strokeWidth: 6, strokeOpacity: 1 }
  });
  const distance = Number(route.properties?.distance || 0);
  setInner("distance", distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`);
  document.getElementById("routeInfo").hidden = false;
  status(`Rute dihitung dari ${from.name} ke ${to.name}. Garis merah menunjukkan jalur pada polyline yang tersedia.`, "success");
}

function resetMap() {
  routeLayerRemove?.();
  routeLayerRemove = null;
  document.getElementById("routeInfo").hidden = true;
  drawCampus();
  status("Peta dikembalikan ke tampilan awal.");
}

onClick("routeBtn", showRoute);
onClick("resetBtn", resetMap);
onClick("swap", () => {
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const oldFrom = from.value;
  from.value = to.value;
  to.value = oldFrom;
});

createMap(MAP_ID, {
  center: [107.5759, -6.8736],
  zoom: 17,
  maxZoom: 21
});

fetch(DATA_URL)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
      throw new Error("Format GeoJSON harus berupa FeatureCollection.");
    }
    campusData = data;
    populateLocations();
    drawCampus();
    const roadCount = data.features.filter(f => ["LineString", "MultiLineString"].includes(f.geometry?.type)).length;
    setInner("featureCount", `${buildings.length} bangunan · ${roadCount} polyline`);
    status("Data kampus berhasil dimuat. Pilih lokasi, lalu tekan Tampilkan rute.");
  })
  .catch(error => {
    console.error(error);
    status("Data kampus gagal dimuat. Pastikan data.geojson berada satu folder dengan index.html dan website dibuka melalui GitHub Pages atau server lokal.", "error");
    setInner("featureCount", "Data gagal dimuat");
  });
