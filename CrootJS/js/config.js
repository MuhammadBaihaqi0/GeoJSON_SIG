export const geojsonData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "title": "Rute Gojek GoRide",
        "jalan_awal": "Jl. Kebon Kawung (Stasiun Bandung)",
        "jalan_akhir": "Jl. Asia Afrika (Alun-Alun Bandung)",
        "layanan": "GoRide",
        "ongkos": "Rp10.000",
        "tipe": "route"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [107.6025, -6.9126],
          [107.6050, -6.9150],
          [107.6097, -6.9218]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "title": "TITIK AWAL (Penjemputan)",
        "nama_jalan": "Jl. Kebon Kawung (Stasiun Bandung)",
        "ongkos": "Rp10.000",
        "tipe": "start"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [107.6025, -6.9126]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "title": "TITIK TUJUAN (Pengantaran)",
        "nama_jalan": "Jl. Asia Afrika (Alun-Alun Bandung)",
        "ongkos": "Rp10.000",
        "tipe": "end"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [107.6097, -6.9218]
      }
    }
  ]
};