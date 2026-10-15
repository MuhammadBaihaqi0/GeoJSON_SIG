# Rute Kampus ULBI — CrootJS

Website statis untuk menampilkan gedung GeoJSON dan menghitung rute terpendek pada `LineString`/`MultiLineString` menggunakan CrootJS.

## Isi folder
- `index.html` — struktur halaman
- `style.css` — tampilan responsif
- `main.js` — interaksi, peta, dan pencarian rute memakai modul CrootJS
- `data.geojson` — data yang diberikan, disalin sebagai GeoJSON

## Menjalankan
Buka folder melalui server lokal (contoh VS Code Live Server), atau unggah seluruh file ke repository GitHub dan aktifkan GitHub Pages.

## Aktifkan GitHub Pages
1. Buat repository baru di GitHub.
2. Upload semua file di folder ini ke root repository.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/(root)`, lalu **Save**.
6. Tunggu proses deployment, lalu buka URL yang ditampilkan GitHub Pages.

## Penting tentang kualitas rute
Modul `findRoute` hanya bisa menghitung rute jika garis jalan tersambung pada titik koordinat yang sama. File GeoJSON awal berisi banyak poligon gedung dan satu `LineString`. Karena itu, website ini menampilkan data tersebut dan mencoba menghitung rute pada garis yang tersedia, tetapi rute antargedung yang sebenarnya mungkin belum ditemukan sebelum semua ruas jalan dan persimpangan kampus ditambahkan sebagai `LineString` yang saling tersambung. Tidak ada jalan yang direkayasa atau ditambahkan tanpa data koordinat yang benar.

## Teknologi
HTML + CSS + JavaScript ES Modules dengan modul CrootJS dari jsDelivr. Modul peta memakai tile OpenStreetMap dan menampilkan atribusi © OpenStreetMap contributors.
