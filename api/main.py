from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import httpx
import base64
import json
import re
import asyncio

load_dotenv()

app = FastAPI()

@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    if request.url.path.startswith("/api"):
        request.scope["path"] = request.url.path[4:]
    response = await call_next(request)
    return response

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:5173",
    "https://readme-gen.vercel.app",
    "https://readmegeneratorai.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Ambil variabel lingkungan
GITHUB_PAT = os.getenv("GITHUB_PAT")

# Load keys from separate variables (GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.)
GOOGLE_API_KEYS = []
i = 1
while True:
    key = os.getenv(f"GOOGLE_API_KEY_{i}")
    if not key:
        # Fallback for the first key without index if exist
        if i == 1:
            base_key = os.getenv("GOOGLE_API_KEY")
            if base_key:
                GOOGLE_API_KEYS.append(base_key.strip().strip('"').strip("'"))
        break
    GOOGLE_API_KEYS.append(key.strip().strip('"').strip("'"))
    i += 1

# Debug: Show masked keys to verify loading
print(f"[DEBUG] System found {len(GOOGLE_API_KEYS)} keys.", flush=True)
for idx, k in enumerate(GOOGLE_API_KEYS):
    print(f"[DEBUG] Key-{idx+1} (Len:{len(k)}): {k[:14]}...{k[-10:]}", flush=True)

# Global counter for round-robin rotation
api_key_index = 0

# Validasi variabel lingkungan
if not GITHUB_PAT:
    print("WARNING: GITHUB_PAT environment variable not set.")
if not GOOGLE_API_KEYS:
    print("WARNING: GOOGLE_API_KEYS (or GOOGLE_API_KEY) environment variable not set.")

GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_PAT}",
    "Accept": "application/vnd.github.v3+json",
}

GITHUB_URL_REGEX = re.compile(r"^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+(\/)?$")

class OutputPreferences(BaseModel):
    projectPurpose: str = "portfolio"
    language: str = "indonesian"
    tone: str = "professional"
    complexity: str = "standard"
    includeSections: list[str] = ["Features", "Installation", "Usage", "Contributing", "License"]
    # New Phase 2 fields
    targetAudience: str = "developer"
    verbosity: str = "comprehensive"
    useEmojis: bool = True
    useIcons: bool = True
    logoUrl: str = ""
    screenshotUrl: str = ""
    deployUrl: str = ""
    includeTOC: bool = True

class GitHubUrl(BaseModel):
    githubUrl: str
    preferences: OutputPreferences = OutputPreferences()

def decode_base64_content(encoded_content: str) -> str:
    """Mendekode konten Base64."""
    try:
        return base64.b64decode(encoded_content).decode('utf-8')
    except Exception as e:
        print(f"Error decoding base64 content: {e}")
        return ""

async def get_github_directory_contents(github_url: str, github_pat: str) -> dict:
    """
    Mengambil struktur direktori dan konten file kunci dari repositori GitHub.
    """
    try:
        return await fetch_github_data(github_url, github_pat)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="generator.errors.api.unexpected_error")

def parse_github_url(github_url: str) -> tuple[str, str, str]:
    """Menganalisis URL GitHub dan mengembalikan pemilik, repositori, dan jalur."""
    # Menghapus skema dan www. jika ada
    cleaned_url = github_url.replace("https://", "").replace("http://", "").replace("www.", "")
    parts = cleaned_url.split('/')

    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url_format")

    owner = parts[1]
    repo = parts[2].replace(".git", "") # Hapus .git jika ada
    path = '/'.join(parts[3:]) if len(parts) > 3 else ""
    return owner, repo, path

async def fetch_github_data(github_url: str, github_pat: str) -> dict:
    """Mengambil data repositori GitHub, struktur direktori, dan konten file kunci."""
    url_parts = github_url.split('/')
    owner = url_parts[3]
    repo = url_parts[4].replace(".git", "")
    if not owner or not repo:
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url")

    GITHUB_HEADERS = {
        "Authorization": f"token {github_pat}",
        "Accept": "application/vnd.github.v3+json"
    } if github_pat else {"Accept": "application/vnd.github.v3+json"}

    repo_data = {}
    async with httpx.AsyncClient() as client:
        try:
            # Panggilan 1: Mendapatkan metadata dasar repo
            repo_info_url = f"https://api.github.com/repos/{owner}/{repo}"
            repo_info_response = await client.get(repo_info_url, headers=GITHUB_HEADERS)
            repo_info_response.raise_for_status()
            repo_info = repo_info_response.json()
            repo_data["name"] = repo_info.get("name")
            repo_data["description"] = repo_info.get("description", "Tidak ada deskripsi.")
            repo_data["language"] = repo_info.get("language", "Tidak diketahui.")
            repo_data["html_url"] = repo_info.get("html_url", f"https://github.com/{owner}/{repo}")
            repo_data["owner"] = repo_info.get("owner", {})
            
            # Panggilan tambahan: Mendapatkan kontributor
            contributors_url = f"https://api.github.com/repos/{owner}/{repo}/contributors?per_page=5"
            contributors_response = await client.get(contributors_url, headers=GITHUB_HEADERS)
            if contributors_response.status_code == 200:
                repo_data["contributors"] = contributors_response.json()
            else:
                repo_data["contributors"] = []

            # Fungsi bantu rekursif untuk mengambil isi subdirektori
            async def get_directory_contents_async(dir_path: str = "") -> dict:
                contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{dir_path}"
                contents_response = await client.get(contents_url, headers=GITHUB_HEADERS)
                contents_response.raise_for_status()
                contents = contents_response.json()
                dir_structure = {}
                for item in contents:
                    if item["type"] == "dir":
                        dir_structure[item["name"]] = await get_directory_contents_async(f"{dir_path}/{item['name']}")
                    else:
                        dir_structure[item["name"]] = "file"
                return dir_structure

            # Panggilan 2: Mendapatkan struktur direktori lengkap (rekursif)
            repo_data["full_directory_structure"] = await get_directory_contents_async()

            # Panggilan 3: Mendapatkan isi direktori root untuk file kunci
            root_contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents/"
            root_contents_response = await client.get(root_contents_url, headers=GITHUB_HEADERS)
            root_contents_response.raise_for_status()
            root_contents = root_contents_response.json()

            repo_data["files"] = [item["name"] for item in root_contents if item["type"] == "file"]

            # Mencari dan mengambil konten file kunci
            key_files = {"package.json": "", "requirements.txt": ""}
            for item in root_contents:
                if item["type"] == "file" and item["name"] in key_files:
                    file_content_url = item["url"]
                    file_content_response = await client.get(file_content_url, headers=GITHUB_HEADERS)
                    file_content_response.raise_for_status()
                    file_data = file_content_response.json()
                    if file_data.get("encoding") == "base64":
                        key_files[item["name"]] = decode_base64_content(file_data["content"])
                    else:
                        key_files[item["name"]] = file_data.get("content", "")
            repo_data["key_files_content"] = key_files

        except httpx.HTTPStatusError as e:
            if e.response is not None and e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="generator.errors.api.repo_not_found")
            raise HTTPException(status_code=500, detail="generator.errors.api.fetch_failed")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail="generator.errors.api.network_error")
    return repo_data

def build_llm_prompt(repo_data: dict, preferences: OutputPreferences) -> list:
    """Membangun prompt yang komprehensif untuk LLM dengan preferensi pengguna."""
    
    # Map tone to instruction
    tone_instructions = {
        "professional": "Gunakan gaya bahasa profesional, formal, dan objektif.",
        "technical": "Gunakan gaya bahasa teknis, mendalam, dan fokus pada detail implementasi.",
        "casual": "Gunakan gaya bahasa santai, ramah, dan mudah dimengerti.",
        "creative": "Gunakan gaya bahasa kreatif, menarik, dan penuh semangat."
    }
    
    selected_tone = tone_instructions.get(preferences.tone.lower(), tone_instructions["professional"])
    
    # Map language
    language_map = {
        "indonesian": "Bahasa Indonesia",
        "english": "Bahasa Inggris"
    }
    selected_language = language_map.get(preferences.language.lower(), "Bahasa Indonesia")

    # Map target audience
    audience_instructions = {
        "developer": "Target audiens Anda adalah pengembang (developers). Fokus pada detail teknis, instruksi build, arsitektur, dan cara kontribusi.",
        "end-user": "Target audiens Anda adalah pengguna akhir (end-users). Fokus pada instruksi instalasi sederhana, cara penggunaan fitur utama, dan kemudahan navigasi."
    }
    selected_audience = audience_instructions.get(preferences.targetAudience.lower(), audience_instructions["developer"])

    # Map verbosity
    verbosity_instructions = {
        "minimal": "Berikan penjelasan yang singkat, padat, dan efisien (minimalis).",
        "comprehensive": "Berikan penjelasan yang mendalam, detail, dan komprehensif."
    }
    selected_verbosity = verbosity_instructions.get(preferences.verbosity.lower(), verbosity_instructions["comprehensive"])

    # Emoji & Icons
    emoji_instr = "Sertakan emoji yang relevan untuk membuat README lebih menarik." if preferences.useEmojis else "Jangan gunakan emoji sama sekali."
    icon_instr = "Gunakan ikon atau badge teknologi (seperti dari Shields.io atau Simple Icons) untuk bagian daftar teknologi." if preferences.useIcons else "Tampilkan daftar teknologi sebagai teks biasa atau list."
    
    # Table of Contents
    toc_instr = (
        "Buatkan daftar isi (Table of Contents) di bagian atas README. "
        "ATURAN JANGKAR (ANCHOR) GITHUB: \n"
        "PENTING: Jika judul bagian dimulai dengan emoji (misal '## 💻 Tech Stack'), "
        "maka link daftar isinya WAJIB diawali dengan tanda hubung setelah karakter hash (misal: '[Tech Stack](#-tech-stack)'). "
        "Ini wajib agar link bisa diklik di sistem. Jika judul tidak diawali emoji, gunakan format biasa (misal '#features')."
    ) if preferences.includeTOC else ""

    # Map Project Purpose
    purpose_key = (preferences.projectPurpose or "portfolio").lower()
    purpose_instructions = {
        "portfolio": (
            "Tulis ini sebagai proyek portofolio profesional. "
            "Fokus pada 'Value Proposition' (nilai jual), pengalaman pengguna, fitur unik, dan kemudahan penggunaan. "
            "Pada bagian 'Installation' & 'Usage', buatlah instruksi yang cepat dan efisien (quick start) agar rekruter bisa melihat hasilnya tanpa hambatan."
        ),
        "academic": (
            "Tulis ini sebagai dokumentasi proyek akademik, riset, atau Tugas Akhir. "
            "Gunakan bahasa yang formal, objektif, dan teknis. Hindari bahasa pemasaran. "
            "Pada bagian 'Features', fokus pada kapabilitas sistem dan metodologi teknis. "
            "Pada bagian 'Installation', fokus pada reproduksibilitas (setup lingkungan riset, dependensi spesifik). "
            "Pada bagian 'Usage', jelaskan cara menjalankan eksperimen, pengujian model, atau evaluasi."
        ),
        "opensource": (
            "Tulis ini sebagai library atau tool open-source publik. "
            "Fokus pada kemudahan integrasi, kolaborasi, dan dokumentasi API yang lengkap. "
            "Pada bagian 'Features', buat daftar kapabilitas yang memudahkan developer lain. "
            "Pada bagian 'Installation', gunakan standar package manager yang relevan. "
            "Pada bagian 'Usage', WAJIB sertakan contoh kode (code snippets) yang jelas dan aplikatif."
        )
    }
    selected_purpose = purpose_instructions.get(purpose_key, purpose_instructions["portfolio"])

    # Define the strict order of sections as per Implementation Plan V2
    SECTION_ORDER = [
        "Logo", "Badges", "Project Description", "Screenshot",
        "Tech Stack", "Features", "Directory Structure", "Installation",
        "Configuration", "Usage", "Contributing", "Authors",
        "Roadmap", "FAQ", "License"
    ]

    # Filter and sort includeSections based on the defined order
    requested_sections = [s for s in SECTION_ORDER if s in preferences.includeSections]
    
    # Re-sort to maintain order
    final_sections = [s for s in SECTION_ORDER if s in requested_sections]

    system_prompt = (
        f"Anda adalah seorang Technical Writer ahli. Saat ini adalah Mei 2026. "
        f"Tugas Anda adalah membuat file README.md yang sangat akurat, informatif, dan profesional "
        f"dalam {selected_language} untuk proyek GitHub yang diberikan.\n"
        f"Tujuan Proyek: {selected_purpose}\n"
        f"Target Audiens: {selected_audience}\n"
        f"Instruksi Gaya Bahasa: {selected_tone}\n"
        f"Tingkat Detail per Seksi: {selected_verbosity}\n"
        f"{emoji_instr}\n"
        f"{icon_instr}\n"
        f"{toc_instr}\n\n"
        "ATURAN WAJIB:\n"
        "1. README HANYA boleh mencakup bagian-bagian berikut dalam urutan yang sudah ditentukan. "
        "JANGAN tambahkan bagian lain di luar daftar ini:\n" +
        "\n".join([f"   {i+1}. {section}" for i, section in enumerate(final_sections)]) + "\n\n"
        "2. Setiap seksi harus konsisten dengan 'Tingkat Detail per Seksi' yang telah ditentukan.\n"
        "3. AKURASI DATA & TAHUN: \n"
        f"   - Tahun pembuatan proyek (HANYA untuk referensi internal): {repo_data.get('created_at', 'Tidak diketahui')[:4] if repo_data.get('created_at') else 'Tidak diketahui'}\n"
        f"   - Update terakhir proyek (HANYA untuk referensi internal): {repo_data.get('pushed_at', 'Tidak diketahui')[:4] if repo_data.get('pushed_at') else 'Tidak diketahui'}\n"
        "   - JANGAN tulis kalimat tentang tahun pembuatan/pembaruan proyek secara eksplisit di README (misal: 'Proyek ini dibuat pada tahun X'). Informasi tahun hanya boleh muncul di bagian Copyright/License jika memang relevan.\n"
        "   - Jika HARUS menyebut tahun, gunakan data tahun di atas. JANGAN mengarang tahun lain (misal 2023).\n"
        "4. ANTI-HALUSINASI & GAYA BAHASA:\n"
        "   - JANGAN gunakan kata-kata ragu (misal: 'mungkin', 'sepertinya', 'kemungkinan besar', 'likely'). Tulis dengan tegas.\n"
        "   - Basekan seluruh konten teknis pada data nyata. JANGAN mengarang fitur atau dependensi yang tidak ada di file konfigurasi.\n"
        "   - Jika informasi tidak ada, gunakan placeholder '_(Tambahkan deskripsi di sini)_'.\n"
        "5. BADGES: Jika seksi 'Badges' diminta, Anda WAJIB menampilkannya sebagai gambar Markdown di bagian paling atas README. \n"
        "6. TECH STACK BADGES: Jika menggunakan badge di Tech Stack, Anda WAJIB menggunakan format gambar Markdown: ![alt](https://img.shields.io/badge/...). DILARANG menggunakan backticks (``) atau hanya teks URL.\n"
        "7. ANTI-HALLUCINATION: DILARANG KERAS 'menebak' (inferred) atau mengarang konten. Dilarang menulis '(Inferred from...)' atau sejenisnya. Hanya tulis apa yang benar-benar ada di data yang diberikan. Jika tidak yakin, gunakan placeholder '_(Deskripsi belum tersedia)_'.\n"
        "8. Output HARUS langsung dimulai dengan konten Markdown. "
    )

    user_prompt = f"""
Identify the project purpose as: {purpose_key.upper()}

Main Instructions:
1. Write a professional README.md for this GitHub repository: {repo_data.get("html_url", "Tidak tersedia")}
2. Use the following project metadata to ensure accuracy:
   - Name: {repo_data.get('name')}
   - Description: {repo_data.get('description')}
   - Primary Language: {repo_data.get('language')}
   - Owner: {repo_data.get('owner', {}).get('login')}
   - Contributors: {', '.join([c.get('login') for c in repo_data.get('contributors', [])[:5]])}
3. IMPORTANT: For the 'Authors' or 'Maintainers' section, USE the real GitHub Owner and Contributors names listed above. DO NOT use placeholders.
4. IMPORTANT: DO NOT create a separate 'Badges' section in the body. Badges should ONLY be placed at the very top of the file as images.
5. Use {selected_language} for the entire content.
6. Format with beautiful Markdown, use emojis, and clean dividers.
7. Include these sections: {', '.join(final_sections)}.

Struktur Direktori Lengkap:
{json.dumps(repo_data.get("full_directory_structure", {}), indent=2)}
Daftar File di Root: {', '.join(repo_data.get("files", []))}
    """

    # Add specific instructions for advanced sections
    if "Badges" in final_sections:
        repo_url_for_badge = repo_data.get('html_url', '').rstrip('/')
        if repo_url_for_badge.endswith('.git'):
            repo_url_for_badge = repo_url_for_badge[:-4]
        
        url_parts = repo_url_for_badge.split('/')
        owner_repo = f"{url_parts[-2]}/{url_parts[-1]}" if len(url_parts) >= 2 else 'owner/repo'
        
        user_prompt += (
            f"\n- Badges: WAJIB tampilkan badge sebagai gambar Markdown menggunakan sintaks ![label](url). "
            f"Gunakan URL Shields.io yang sebenarnya. Contoh format yang HARUS digunakan:\n"
            f"  ![GitHub stars](https://img.shields.io/github/stars/{owner_repo}?style=for-the-badge)\n"
            f"  ![License](https://img.shields.io/github/license/{owner_repo}?style=for-the-badge)\n"
            f"  ![GitHub last commit](https://img.shields.io/github/last-commit/{owner_repo}?style=for-the-badge)\n"
            f"  JANGAN tulis deskripsi teks tentang badge. LANGSUNG tampilkan sintaks gambar Markdown di atas."
        )
    if "Tech Stack" in final_sections:
        user_prompt += "\n- Tech Stack: List framework dan library utama yang ditemukan di file konfigurasi."
    if "Directory Structure" in final_sections:
        user_prompt += "\n- Directory Structure: Berikan gambaran pohon direktori yang rapi dan penjelasan singkat folder utama."

    # Logo, Screenshot, & Deployment
    if preferences.logoUrl:
        user_prompt += f"\nLogo URL: {preferences.logoUrl}"
    if preferences.screenshotUrl:
        user_prompt += f"\nScreenshot/Demo Image URL: {preferences.screenshotUrl}"
    if preferences.deployUrl:
        user_prompt += f"\nDeployment/Live App URL: {preferences.deployUrl}"

    user_prompt += "\n\n--- Konteks File Kunci ---"

    if repo_data["key_files_content"].get("package.json"):
        user_prompt += f"\n\nKonten package.json:\n```json\n{repo_data['key_files_content']['package.json']}\n```"
    if repo_data["key_files_content"].get("requirements.txt"):
        user_prompt += f"\n\nKonten requirements.txt:\n```text\n{repo_data['key_files_content']['requirements.txt']}\n```"

    user_prompt += "\n\n--- Akhir Konteks ---"

    # Clean up instructions to avoid empty lines or formatting issues
    preset_extra = ""
    if purpose_key == 'academic':
        preset_extra = "- KHUSUS AKADEMIK: Gunakan terminologi teknis/ilmiah. Pastikan bagian 'Features' mencakup kapabilitas sistem dalam konteks riset. Bagian 'Installation' harus mendukung reproduksibilitas."
    elif purpose_key == 'portfolio':
        preset_extra = "- KHUSUS PORTFOLIO: Fokus pada kemudahan navigasi dan visualisasi hasil. Tonjolkan fitur yang paling menarik bagi pembaca umum/rekruter."
    elif purpose_key == 'opensource':
        preset_extra = "- KHUSUS OPEN SOURCE: Berikan instruksi yang jelas bagi kontributor baru. Pastikan contoh penggunaan (Usage) sangat detail dengan blok kode."

    user_prompt += f"""
Buat README.md yang informatif dan menarik dalam {selected_language} berdasarkan informasi di atas.
WAJIB ikuti urutan seksi ini: {', '.join(final_sections)}.
{f"Pastikan untuk menyertakan instruksi 'Instalasi' dan 'Penggunaan' yang jelas." if "Installation" in preferences.includeSections or "Usage" in preferences.includeSections else ""}
Deskripsikan struktur proyek secara akurat berdasarkan 'Struktur Direktori Lengkap' yang diberikan.

PANDUAN KHUSUS BERDASARKAN PRESET:
{preset_extra}
"""

    if preferences.logoUrl:
        user_prompt += f"\nTempatkan logo dari URL {preferences.logoUrl} di bagian paling atas README."
    if preferences.screenshotUrl:
        user_prompt += f"\nTempatkan screenshot/demo dari URL {preferences.screenshotUrl} setelah deskripsi proyek atau di bagian yang sesuai."
    if preferences.deployUrl:
        user_prompt += f"\nJika ada Deployment URL ({preferences.deployUrl}), tampilkan sebagai link 'Live Demo' atau 'Visit Website' yang menonjol di bagian atas (setelah deskripsi) atau di bagian yang relevan."

    user_prompt += """
PENTING: Jangan berikan teks apapun selain konten Markdown. Jangan ada kalimat pembuka seperti 'Tentu, ini hasil generasinya'. Selalu mulai langsung dengan `# Judul Proyek` atau konten README.
JANGAN sertakan bagian yang tidak ada dalam daftar yang diminta di atas (kecuali License yang WAJIB selalu ada).
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

async def call_google_ai(prompt_messages: list, api_keys: list) -> str:
    """Call Google AI Studio API directly with rotation and failover logic"""
    if not api_keys:
        raise HTTPException(status_code=500, detail="generator.errors.api.no_google_key")

    global api_key_index
    
    # Merge system prompt into the first user message.
    contents = []
    system_text = ""
    for msg in prompt_messages:
        if msg["role"] == "system":
            system_text = msg["content"]
        elif msg["role"] == "user":
            combined = f"{system_text}\n\n{msg['content']}" if system_text else msg["content"]
            contents.append({"role": "user", "parts": [{"text": combined}]})
            system_text = ""  # only prepend once
        elif msg["role"] == "assistant":
            contents.append({"role": "model", "parts": [{"text": msg["content"]}]})
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192
        }
    }
    
    # Using gemini-2.5-flash as requested
    model = "gemini-2.5-flash"
    
    # Number of keys available
    num_keys = len(api_keys)
    # We will try at most all available keys + some retries
    max_attempts = num_keys * 2
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_attempts):
            # Rotate key: use current index and increment for next request
            current_key = api_keys[api_key_index % num_keys]
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={current_key}"
            
            try:
                response = await client.post(url, json=payload, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                
                # Success! Move index for next request distribution
                api_key_index = (api_key_index + 1) % num_keys
                return result["candidates"][0]["content"]["parts"][0]["text"]
                
            except httpx.HTTPStatusError as e:
                # Handle Rate Limit (429), Service Unavailable (503), and Invalid API Key (400 with specific reason)
                if e.response.status_code in [429, 503]:
                    reason = "rate limit (429)" if e.response.status_code == 429 else "service busy (503)"
                    print(f"[API] Key {api_key_index % num_keys} hit {reason}. Attempt {attempt + 1}/{max_attempts}")
                    api_key_index = (api_key_index + 1) % num_keys
                    if attempt >= num_keys - 1:
                        wait_time = 5 * (2 ** (attempt // num_keys))
                        await asyncio.sleep(wait_time)
                    continue
                
                if e.response.status_code == 400:
                    error_data = e.response.json()
                    print(f"[DEBUG] Google 400 Error: {error_data}", flush=True)
                    error_reason = error_data.get("error", {}).get("status", "")
                    
                    if "INVALID_ARGUMENT" in error_reason or "API_KEY_INVALID" in str(error_data):
                        print(f"[API] Key {api_key_index % num_keys} is REJECTED by Google. Rotating...", flush=True)
                        api_key_index = (api_key_index + 1) % num_keys
                        continue
                
                raise HTTPException(status_code=e.response.status_code, detail="generator.errors.api.unknown")

            except Exception as e:
                print(f"Internal Error in call_google_ai: {str(e)}")
                if attempt < max_attempts - 1:
                    api_key_index = (api_key_index + 1) % num_keys
                    continue
                raise HTTPException(status_code=500, detail="generator.errors.api.unknown")

    raise HTTPException(status_code=503, detail="generator.errors.api.busy")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI README Generator Backend!"}



@app.post("/generate-readme")
async def generate_readme_api(github_url_data: GitHubUrl):
    """Endpoint untuk menghasilkan README.md dari URL GitHub."""
    github_url = github_url_data.githubUrl.strip()
    
    if not GITHUB_URL_REGEX.match(github_url):
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url")
    try:
        github_data = await get_github_directory_contents(github_url, GITHUB_PAT)
        prompt_messages = build_llm_prompt(github_data, github_url_data.preferences)
        readme_content = await call_google_ai(prompt_messages, GOOGLE_API_KEYS)
        return {"readme": readme_content}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unhandled error: {e}")
        raise HTTPException(status_code=500, detail="generator.errors.api.internal_error")
