![GitHub stars](https://img.shields.io/github/stars/rossihana/Readme-Generator?style=for-the-badge)
![License](https://img.shields.io/github/license/rossihana/Readme-Generator?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/rossihana/Readme-Generator?style=for-the-badge)

# Readme-Generator

Monorepo untuk AI Readme Generator. Proyek ini menyediakan solusi komprehensif untuk menghasilkan file `README.md` berkualitas tinggi secara otomatis, dirancang khusus untuk kemudahan integrasi dan kolaborasi dalam ekosistem pengembangan perangkat lunak. Dengan arsitektur monorepo, proyek ini memisahkan logika _frontend_ dan _backend_ untuk fleksibilitas dan skalabilitas yang optimal.

## 🌟 Ikhtisar Proyek

`Readme-Generator` adalah _tool_ sumber terbuka yang bertujuan untuk menyederhanakan proses pembuatan `README.md` yang informatif dan menarik. Dengan _interface_ berbasis web yang intuitif dan _backend_ API yang kuat, pengembang dapat dengan cepat menghasilkan dokumentasi proyek yang konsisten dan profesional, menghemat waktu dan upaya yang signifikan. Proyek ini sangat berfokus pada pengalaman pengembang, menyediakan API yang terdokumentasi dengan baik dan struktur proyek yang mudah dipahami.

---

## 📚 Daftar Isi

-   [🌟 Ikhtisar Proyek](#ikhtisar-proyek)
-   [🛠️ Tumpukan Teknologi](#tumpukan-teknologi)
-   [✨ Fitur](#fitur)
-   [📂 Struktur Direktori](#struktur-direktori)
-   [🚀 Instalasi](#instalasi)
-   [⚙️ Konfigurasi](#konfigurasi)
-   [💡 Penggunaan](#penggunaan)
-   [🤝 Berkontribusi](#berkontribusi)
-   [✍️ Penulis](#penulis)
-   [🗺️ Peta Jalan (Roadmap)](#peta-jalan-roadmap)
-   [❓ FAQ](#faq)
-   [📜 Lisensi](#lisensi)

---

## 🛠️ Tumpukan Teknologi

Proyek `Readme-Generator` dibangun menggunakan kombinasi teknologi modern untuk memastikan performa, skalabilitas, dan kemudahan pengembangan.

### Backend

| Kategori | Teknologi | Deskripsi |
| :------- | :-------- | :-------- |
| Bahasa | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) | Bahasa pemrograman utama untuk logika API. |
| Kerangka Kerja | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) | Kerangka kerja web yang cepat dan modern untuk membangun API. |
| Server ASGI | ![Uvicorn](https://img.shields.io/badge/Uvicorn-009688?style=for-the-badge&logo=uvicorn&logoColor=white) | Server ASGI berkecepatan tinggi untuk menjalankan aplikasi FastAPI. |

### Frontend

| Kategori | Teknologi | Deskripsi |
| :------- | :-------- | :-------- |
| Bahasa | ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | Superset JavaScript yang menambahkan _type-safety_. |
| Kerangka Kerja UI | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) | Pustaka JavaScript untuk membangun _user interface_ yang interaktif. |
| _Build Tool_ | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | _Build tool_ _frontend_ yang cepat dan modern. |
| Globalisasi | i18next | Kerangka kerja internasionalisasi untuk mendukung berbagai bahasa. |
| Manajer Paket | ![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) | Manajer paket standar untuk proyek JavaScript/TypeScript. |

### Lain-lain

| Kategori | Teknologi | Deskripsi |
| :------- | :-------- | :-------- |
| _Monorepo Tool_ | ![Concurrently](https://img.shields.io/badge/Concurrently-FF9900?style=for-the-badge) | Utilitas untuk menjalankan beberapa perintah secara bersamaan. |
| _Deployment_ | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) | Platform _serverless_ untuk _deployment_ _frontend_ dan _serverless functions_. |

---

## ✨ Fitur

`Readme-Generator` dirancang dengan serangkaian kapabilitas yang berfokus pada produktivitas pengembang dan kualitas dokumentasi:

*   **Generasi README Berbasis AI:** Secara cerdas menghasilkan konten `README.md` yang relevan dan komprehensif berdasarkan masukan proyek.
*   **Antarmuka Pengguna Intuitif:** Menyediakan _interface_ web yang bersih dan mudah digunakan untuk memasukkan detail proyek dan melihat pratinjau `README` yang dihasilkan.
*   **Dukungan Multi-Bahasa:** Mendukung internasionalisasi melalui `i18n`, memungkinkan pengguna untuk berinteraksi dengan aplikasi dalam berbagai bahasa (saat ini Bahasa Inggris dan Bahasa Indonesia).
*   **Struktur Monorepo:** Memisahkan _frontend_ (React/TypeScript) dan _backend_ (FastAPI/Python) dalam satu repositori, memudahkan pengelolaan dan pengembangan.
*   **API yang Terdokumentasi:** _Backend_ menyediakan API yang jelas dan mudah diakses, memungkinkan integrasi dengan _tool_ atau alur kerja pihak ketiga.
*   **Ekspor Fleksibel:** Kemampuan untuk menyalin konten `README` yang dihasilkan atau mengunduhnya sebagai file `.md`.
*   **Validasi Input Real-time:** Memberikan umpan balik instan pada input pengguna untuk memastikan data yang akurat sebelum generasi.
*   **Integrasi Mudah:** Dirancang sebagai _tool_ atau _library_ yang dapat dengan mudah diintegrasikan ke dalam alur kerja CI/CD atau _script_ otomatisasi lainnya.
*   **Ekstensibilitas:** Arsitektur modular yang memungkinkan penambahan templat `README` baru, fitur generasi, atau integrasi AI model di masa mendatang.

---

## 📂 Struktur Direktori

Proyek ini mengadopsi struktur monorepo untuk mengelola _frontend_ dan _backend_ secara terpisah namun dalam satu repositori.

```
.
├── .gitignore
├── api/
│   ├── index.py
│   ├── main.py
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── .gitignore
│   ├── App.tsx
│   ├── components/
│   │   ├── GeneratorForm.tsx
│   │   ├── InfoSection.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── ReadmeDisplay.tsx
│   │   └── icons.tsx
│   ├── constants.ts
│   ├── i18n.ts
│   ├── index.html
│   ├── index.tsx
│   ├── locales/
│   │   ├── en.json
│   │   └── id.json
│   ├── metadata.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   ├── vite-env.d.ts
│   └── vite.config.ts
└── package.json
```

### Penjelasan Direktori Utama:

*   **`api/`**: Berisi semua kode _backend_ untuk layanan API.
    *   `main.py`: Titik masuk utama untuk aplikasi FastAPI.
    *   `requirements.txt`: Daftar dependensi Python untuk _backend_.
    *   `vercel.json`: Konfigurasi _deployment_ Vercel untuk _backend_ sebagai _serverless function_.
*   **`frontend/`**: Berisi semua kode _frontend_ untuk aplikasi web.
    *   `App.tsx`: Komponen utama aplikasi React.
    *   `components/`: Direktori untuk komponen React yang dapat digunakan kembali.
    *   `locales/`: Berisi file JSON untuk data terjemahan (internasionalisasi).
    *   `package.json`: Manifes proyek dan dependensi Node.js untuk _frontend_.
    *   `vite.config.ts`: Konfigurasi untuk _build tool_ Vite.
    *   `vercel.json`: Konfigurasi _deployment_ Vercel untuk _frontend_.
*   **`package.json` (root)**: Manifes monorepo yang mendefinisikan _script_ untuk menjalankan dan membangun kedua bagian proyek.

---

## 🚀 Instalasi

Untuk menjalankan proyek `Readme-Generator` secara lokal, ikuti langkah-langkah di bawah ini. Pastikan Anda memiliki Node.js (dengan npm) dan Python (dengan pip) terinstal di sistem Anda.

### 1. Kloning Repositori

```bash
git clone https://github.com/rossihana/Readme-Generator.git
cd Readme-Generator
```

### 2. Instalasi Dependensi Root

Instal dependensi yang diperlukan untuk mengelola monorepo, seperti `concurrently`.

```bash
npm install
```

### 3. Instalasi Dependensi Frontend

Navigasi ke direktori `frontend` dan instal dependensi Node.js/NPM.

```bash
cd frontend
npm install
cd .. # Kembali ke direktori root
```

### 4. Instalasi Dependensi Backend

Navigasi ke direktori `api` dan instal dependensi Python menggunakan `pip`.

```bash
cd api
pip install -r requirements.txt
cd .. # Kembali ke direktori root
```

---

## ⚙️ Konfigurasi

Proyek ini mungkin memerlukan konfigurasi variabel lingkungan untuk fungsionalitas penuh, terutama untuk integrasi dengan layanan AI eksternal atau konfigurasi API.

### Variabel Lingkungan

Buat file `.env` di direktori `api/` dan `frontend/` jika diperlukan. Saat ini, tidak ada variabel lingkungan wajib yang didefinisikan secara eksplisit dalam konfigurasi yang diberikan, namun praktik terbaik menyarankan untuk mengantisipasi hal ini.

**Contoh `.env` untuk API (di `api/.env`):**

```
# Kunci API untuk layanan AI eksternal (jika digunakan)
AI_API_KEY=your_ai_api_key_here
# URL dasar untuk API (jika berjalan di domain berbeda)
BASE_URL=http://localhost:8000
```

**Contoh `.env` untuk Frontend (di `frontend/.env`):**

```
# URL endpoint API backend
VITE_API_BASE_URL=http://localhost:8000
```

**Langkah-langkah Konfigurasi:**

1.  Buat file `.env` di direktori `api/` dan `frontend/`.
2.  Isi file `.env` dengan variabel yang diperlukan.
3.  Pastikan `.env` terdaftar di `.gitignore` masing-masing (sudah ada secara default).

_(Tambahkan deskripsi lebih lanjut mengenai konfigurasi spesifik jika ada file konfigurasi lain seperti `config.json` atau `settings.py` yang memerlukan penyesuaian. Saat ini, fokus pada variabel lingkungan.)_

---

## 💡 Penggunaan

Setelah instalasi dan konfigurasi selesai, Anda dapat menjalankan proyek secara lokal dan mulai menggunakannya.

### 1. Menjalankan Aplikasi

Dari direktori root proyek, jalankan perintah _start_ yang akan memulai _frontend_ dan _backend_ secara bersamaan:

```bash
npm start
```

Ini akan melakukan dua hal:
*   Memulai server pengembangan _frontend_ (Vite) di `http://localhost:5173` (port default Vite).
*   Memulai server API _backend_ (Uvicorn) di `http://localhost:8000`.

### 2. Mengakses Antarmuka Pengguna (Frontend)

Buka _browser_ web Anda dan navigasikan ke `http://localhost:5173`. Anda akan melihat antarmuka `Readme-Generator` di mana Anda dapat memasukkan detail proyek Anda dan menghasilkan `README.md`.

### 3. Menggunakan API (Backend)

API _backend_ dapat diakses secara terpisah untuk integrasi programatik. Dokumentasi API interaktif (Swagger UI) biasanya tersedia di `http://localhost:8000/docs`.

#### Contoh Penggunaan API dengan `curl`

Misalkan Anda ingin menghasilkan `README` untuk proyek fiktif. Anda dapat mengirim permintaan POST ke _endpoint_ `/generate-readme`.

```bash
curl -X POST "http://localhost:8000/generate-readme" \
     -H "Content-Type: application/json" \
     -d '{
           "projectName": "MyAwesomeProject",
           "projectDescription": "A cutting-edge solution for data processing.",
           "technologies": ["Python", "FastAPI", "React", "TypeScript"],
           "features": ["High performance", "Scalable", "Easy to use API"]
         }'
```

Output yang diharapkan adalah JSON yang berisi konten `README.md` yang dihasilkan:

```json
{
  "readme_content": "# MyAwesomeProject\n\nA cutting-edge solution for data processing.\n\n## Features\n\n* High performance\n* Scalable\n* Easy to use API\n\n## Technologies\n\n* Python\n* FastAPI\n* React\n* TypeScript\n\n_(Konten README lengkap akan jauh lebih detail di sini)_"
}
```

#### Contoh Penggunaan API dengan Python

Anda juga dapat mengintegrasikan API ini ke dalam _script_ atau aplikasi Python Anda:

```python
import requests
import json

api_url = "http://localhost:8000/generate-readme"
payload = {
    "projectName": "MyAwesomePythonTool",
    "projectDescription": "Sebuah alat Python untuk otomatisasi tugas-tugas administratif.",
    "technologies": ["Python", "Pandas", "OpenPyXL"],
    "features": ["Otomatisasi laporan", "Ekstraksi data", "Integrasi Excel"]
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(api_url, headers=headers, data=json.dumps(payload))
    response.raise_for_status() # Akan memunculkan HTTPError untuk kode status 4xx/5xx

    readme_data = response.json()
    print("README yang Dihasilkan:\n")
    print(readme_data.get("readme_content", "Tidak ada konten README yang diterima."))

except requests.exceptions.HTTPError as http_err:
    print(f"Terjadi kesalahan HTTP: {http_err}")
    print(f"Respon server: {response.text}")
except requests.exceptions.ConnectionError as conn_err:
    print(f"Tidak dapat terhubung ke server API: {conn_err}. Pastikan backend berjalan.")
except requests.exceptions.Timeout as timeout_err:
    print(f"Permintaan ke API habis waktu: {timeout_err}")
except requests.exceptions.RequestException as req_err:
    print(f"Terjadi kesalahan lain saat membuat permintaan: {req_err}")

```

---

## 🤝 Berkontribusi

Kami menyambut kontribusi dari komunitas _open-source_! Jika Anda tertarik untuk meningkatkan `Readme-Generator`, silakan ikuti panduan di bawah ini.

### Cara Berkontribusi

1.  **Fork** repositori ini ke akun GitHub Anda.
2.  **Kloning** _fork_ Anda ke mesin lokal:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Readme-Generator.git
    cd Readme-Generator
    ```
3.  **Buat _branch_ baru** untuk fitur atau perbaikan Anda:
    ```bash
    git checkout -b feature/nama-fitur-baru
    # atau
    git checkout -b bugfix/perbaikan-bug-x
    ```
4.  **Lakukan perubahan** dan uji secara menyeluruh.
5.  **Komit perubahan Anda** dengan pesan yang jelas dan deskriptif:
    ```bash
    git commit -m "feat: Menambahkan fitur X untuk generasi README"
    # atau
    git commit -m "fix: Memperbaiki masalah Y di backend"
    ```
6.  **Dorong _branch_ Anda** ke repositori _fork_ Anda:
    ```bash
    git push origin feature/nama-fitur-baru
    ```
7.  **Buka _Pull Request_ (PR)** ke repositori `rossihana/Readme-Generator` di _branch_ `main`. Pastikan untuk memberikan deskripsi yang jelas tentang perubahan Anda, mengapa itu diperlukan, dan bagaimana Anda mengujinya.

### Pedoman Kontribusi

*   **Gaya Kode:** Pastikan kode Anda mematuhi standar gaya yang ada (misalnya, melalui _linter_ atau _formatter_ otomatis).
*   **Pengujian:** Sertakan pengujian unit atau integrasi yang relevan untuk perubahan Anda jika memungkinkan.
*   **Dokumentasi:** Perbarui dokumentasi apa pun yang terpengaruh oleh perubahan Anda (misalnya, bagian `Features`, `API Usage`).
*   **Pesan Komit:** Gunakan pesan komit yang deskriptif dan mengikuti konvensi (misalnya, Conventional Commits).

---

## ✍️ Penulis

Proyek ini dikembangkan dan dikelola oleh:

*   **rossihana** - [GitHub](https://github.com/rossihana)

---

## 🗺️ Peta Jalan (Roadmap)

Pengembangan `Readme-Generator` adalah proses berkelanjutan. Berikut adalah beberapa fitur dan peningkatan yang direncanakan untuk masa depan:

*   **Integrasi Model AI yang Lebih Lanjut:** Mengganti _placeholder_ generasi dengan model AI yang lebih canggih untuk konten yang lebih kontekstual dan kreatif.
*   **Dukungan Templat Kustom:** Memungkinkan pengguna untuk mendefinisikan dan menggunakan templat `README` mereka sendiri.
*   **Ekstensi Browser/CLI:** Mengembangkan ekstensi _browser_ atau _command-line interface_ (CLI) untuk integrasi yang lebih cepat.
*   **Peningkatan Pengujian Otomatis:** Menambahkan cakupan pengujian yang lebih luas untuk _frontend_ dan _backend_.
*   **Dukungan untuk Bahasa Pemrograman Lain:** Menambahkan kapabilitas generasi `README` yang lebih spesifik untuk proyek-proyek dalam bahasa selain yang sudah didukung.
*   **Fitur Pratinjau Interaktif:** Pratinjau `README` yang lebih kaya dengan dukungan untuk Markdown secara _real-time_.

Kami menyambut ide dan kontribusi untuk mencapai tujuan-tujuan ini!

---

## ❓ FAQ

Berikut adalah beberapa pertanyaan yang sering diajukan mengenai `Readme-Generator`.

**Q1: Apa saja persyaratan untuk menjalankan proyek ini?**
A1: Anda memerlukan Node.js (dengan npm) dan Python (dengan pip) yang terinstal di sistem Anda. Lihat bagian [Instalasi](#instalasi) untuk detail lebih lanjut.

**Q2: Bagaimana cara saya berkontribusi pada proyek ini?**
A2: Kami sangat menyambut kontribusi! Anda dapat melihat panduan lengkap di bagian [Berkontribusi](#berkontribusi).

**Q3: Apakah proyek ini mendukung bahasa lain selain Bahasa Inggris dan Bahasa Indonesia?**
A3: Saat ini, antarmuka pengguna mendukung Bahasa Inggris dan Bahasa Indonesia. Kami berencana untuk menambahkan dukungan bahasa lain di masa mendatang. Kontribusi untuk terjemahan baru sangat dihargai!

**Q4: Apakah API memerlukan kunci autentikasi?**
A4: Untuk _deployment_ lokal, API tidak memerlukan autentikasi secara _default_. Namun, untuk _deployment_ produksi atau integrasi dengan layanan AI eksternal, Anda mungkin perlu mengonfigurasi kunci API atau token autentikasi melalui variabel lingkungan.

**Q5: Bagaimana cara melaporkan _bug_ atau mengajukan permintaan fitur?**
A5: Anda dapat melaporkan _bug_ atau mengajukan permintaan fitur melalui [Issues](https://github.com/rossihana/Readme-Generator/issues) di repositori GitHub ini.

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi ISC. Lihat file [LICENSE](https://github.com/rossihana/Readme-Generator/blob/main/LICENSE) untuk detail lebih lanjut.

```
ISC License

Copyright (c) 2026 rossihana

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```