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
    # Masking more strictly (only show first 6 and last 4)
    print(f"[DEBUG] Key-{idx+1} (Len:{len(k)}): {k[:6]}...{k[-4:]}", flush=True)

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
    targetAudience: str = "developer"
    verbosity: str = "comprehensive"
    useEmojis: bool = True
    useIcons: bool = True
    logoUrl: str = ""
    screenshotUrl: str = ""
    deployUrl: str = ""
    includeTOC: bool = True

class AIConfig(BaseModel):
    provider: str = "default"  # default, gemini_custom, openai, claude, groq, deepseek, ollama, mistral, openrouter, nine_router
    model: str = "gemini-2.5-flash"
    apiKey: str = ""
    ollamaUrl: str = "http://localhost:11434"
    nineRouterUrl: str = "http://localhost:20128"

class GitHubUrl(BaseModel):
    githubUrl: str
    preferences: OutputPreferences = OutputPreferences()
    aiConfig: AIConfig = AIConfig()

class VerifyConnectionRequest(BaseModel):
    aiConfig: AIConfig

class OllamaModelsRequest(BaseModel):
    ollamaUrl: str = "http://localhost:11434"

class NineRouterModelsRequest(BaseModel):
    nineRouterUrl: str = "http://localhost:20128"

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
        f"Anda adalah seorang Technical Writer ahli."
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

# ---------------------------------------------------------------------------
# Multi-provider AI call functions
# ---------------------------------------------------------------------------

async def call_openai_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call OpenAI-compatible API."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "max_tokens": 16384, "temperature": 0.7}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_claude_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call Anthropic Claude API."""
    headers = {"x-api-key": api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"}
    system_text = next((m["content"] for m in prompt_messages if m["role"] == "system"), "")
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages if m["role"] != "system"]
    payload = {"model": model, "max_tokens": 16384, "system": system_text, "messages": messages}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["content"][0]["text"]

async def call_groq_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call Groq API (OpenAI-compatible)."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "max_tokens": 16384, "temperature": 0.7}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_deepseek_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call DeepSeek API (OpenAI-compatible)."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "max_tokens": 8192, "temperature": 0.7}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.deepseek.com/chat/completions", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_mistral_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call Mistral API (OpenAI-compatible)."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "max_tokens": 8192, "temperature": 0.7}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.mistral.ai/v1/chat/completions", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_openrouter_api(prompt_messages: list, api_key: str, model: str) -> str:
    """Call OpenRouter API (OpenAI-compatible)."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI README Generator"
    }
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "temperature": 0.7, "stream": False}
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_9router_api(prompt_messages: list, url: str, api_key: str, model: str) -> str:
    """Call local or custom 9Router API (OpenAI-compatible)."""
    import json
    base = url.rstrip("/")
    endpoint = f"{base}/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    messages = [{"role": m["role"], "content": m["content"]} for m in prompt_messages]
    payload = {"model": model, "messages": messages, "temperature": 0.7, "stream": False}
    async with httpx.AsyncClient() as client:
        resp = await client.post(endpoint, json=payload, headers=headers, timeout=120.0)
        resp.raise_for_status()
        try:
            return resp.json()["choices"][0]["message"]["content"]
        except (json.JSONDecodeError, KeyError, ValueError):
            raw_text = resp.text.strip()
            raise HTTPException(
                status_code=500,
                detail=f"Respon 9Router bukan JSON yang valid. Pastikan 9Router berjalan dan dikonfigurasi dengan benar. Isi respon: {raw_text[:250]}"
            )

async def call_ollama_api(prompt_messages: list, ollama_url: str, model: str) -> str:
    """Call local Ollama API."""
    system_text = next((m["content"] for m in prompt_messages if m["role"] == "system"), "")
    user_text = next((m["content"] for m in prompt_messages if m["role"] == "user"), "")
    combined = f"{system_text}\n\n{user_text}" if system_text else user_text
    payload = {"model": model, "prompt": combined, "stream": False}
    base = ollama_url.rstrip("/")
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{base}/api/generate", json=payload, timeout=300.0)
        resp.raise_for_status()
        return resp.json()["response"]

async def call_ai_assistant(prompt_messages: list, ai_config: AIConfig) -> str:
    """Route call to appropriate AI provider based on ai_config."""
    provider = ai_config.provider
    model = ai_config.model
    api_key = ai_config.apiKey

    if provider == "openai":
        return await call_openai_api(prompt_messages, api_key, model)
    elif provider == "claude":
        return await call_claude_api(prompt_messages, api_key, model)
    elif provider == "groq":
        return await call_groq_api(prompt_messages, api_key, model)
    elif provider == "deepseek":
        return await call_deepseek_api(prompt_messages, api_key, model)
    elif provider == "mistral":
        return await call_mistral_api(prompt_messages, api_key, model)
    elif provider == "openrouter":
        return await call_openrouter_api(prompt_messages, api_key, model)
    elif provider == "nine_router":
        return await call_9router_api(prompt_messages, ai_config.nineRouterUrl, api_key, model)
    elif provider == "ollama":
        return await call_ollama_api(prompt_messages, ai_config.ollamaUrl, model)
    else:
        # Default and gemini_custom both call Google AI
        keys = [api_key] if (provider == "gemini_custom" and api_key) else GOOGLE_API_KEYS
        return await call_google_ai(prompt_messages, keys)

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
            "maxOutputTokens": 20480
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
                response = await client.post(url, json=payload, timeout=120.0)
                response.raise_for_status()
                result = response.json()
                
                # Success! Move index for next request distribution
                api_key_index = (api_key_index + 1) % num_keys
                return result["candidates"][0]["content"]["parts"][0]["text"]
                
            except httpx.HTTPStatusError as e:
                # Get the detailed message if available
                error_msg = ""
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get("error", {}).get("message", "")
                except Exception:
                    error_msg = e.response.text

                # Handle Rate Limit (429), Service Unavailable (503)
                if e.response.status_code in [429, 503]:
                    if num_keys == 1:
                        raise HTTPException(status_code=e.response.status_code, detail="generator.errors.api.rate_limit")
                    reason = "rate limit (429)" if e.response.status_code == 429 else "service busy (503)"
                    print(f"[API] Key {api_key_index % num_keys} hit {reason}. Attempt {attempt + 1}/{max_attempts}")
                    api_key_index = (api_key_index + 1) % num_keys
                    if attempt >= num_keys - 1:
                        wait_time = 5 * (2 ** (attempt // num_keys))
                        await asyncio.sleep(wait_time)
                    continue
                
                # Check for Invalid API key specifically (status 400 with API_KEY_INVALID or status 403/401)
                if e.response.status_code in [400, 401, 403]:
                    try:
                        error_data = e.response.json()
                        error_reason = error_data.get("error", {}).get("status", "")
                        error_text = str(error_data)
                    except Exception:
                        error_reason = ""
                        error_text = e.response.text

                    if "INVALID_ARGUMENT" in error_reason or "API_KEY_INVALID" in error_text or "not valid" in error_text:
                        print(f"[API] Key {api_key_index % num_keys} is REJECTED by Google. Rotating...", flush=True)
                        if num_keys == 1:
                            raise HTTPException(status_code=400, detail="generator.errors.api.invalid_api_key")
                        api_key_index = (api_key_index + 1) % num_keys
                        continue
                
                if num_keys == 1 or attempt == max_attempts - 1:
                    raise HTTPException(status_code=e.response.status_code, detail=f"Google AI Error: {error_msg}")
                
                api_key_index = (api_key_index + 1) % num_keys
                continue

            except Exception as e:
                print(f"Internal Error in call_google_ai: {str(e)}")
                if num_keys == 1 or attempt == max_attempts - 1:
                    raise HTTPException(status_code=500, detail=f"Google AI Connection Error: {str(e)}")
                api_key_index = (api_key_index + 1) % num_keys
                continue

    raise HTTPException(status_code=503, detail="generator.errors.api.busy")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI README Generator Backend!"}


async def _readme_event_stream(github_url: str, preferences: OutputPreferences, ai_config: AIConfig = None):
    if ai_config is None:
        ai_config = AIConfig()
    """Generator async yang menghasilkan event SSE di setiap tahap proses."""

    def make_event(event_name: str, data: dict) -> str:
        return f"event: {event_name}\ndata: {json.dumps(data)}\n\n"

    github_phase_done = False  # track whether GitHub fetch is complete

    try:
        url_parts = github_url.split('/')
        owner = url_parts[3]
        repo = url_parts[4].replace(".git", "")

        GITHUB_HEADERS_LOCAL = {
            "Authorization": f"token {GITHUB_PAT}",
            "Accept": "application/vnd.github.v3+json"
        } if GITHUB_PAT else {"Accept": "application/vnd.github.v3+json"}

        # --- TAHAP 1: Koneksi ---
        yield make_event("status", {"key": "generator.loading.connect"})
        await asyncio.sleep(0)  # flush event ke client

        repo_data = {}
        async with httpx.AsyncClient() as client:

            # --- TAHAP 2a: Ambil metadata repo ---
            yield make_event("status", {"key": "generator.loading.fetch_meta", "repo": repo})
            await asyncio.sleep(0)
            repo_info_url = f"https://api.github.com/repos/{owner}/{repo}"
            resp = await client.get(repo_info_url, headers=GITHUB_HEADERS_LOCAL)
            resp.raise_for_status()
            repo_info = resp.json()
            repo_data["name"] = repo_info.get("name")
            repo_data["description"] = repo_info.get("description", "")
            repo_data["language"] = repo_info.get("language", "")
            repo_data["html_url"] = repo_info.get("html_url", github_url)
            repo_data["owner"] = repo_info.get("owner", {})
            repo_data["created_at"] = repo_info.get("created_at")
            repo_data["pushed_at"] = repo_info.get("pushed_at")

            # --- TAHAP 2b: Ambil kontributor ---
            yield make_event("status", {"key": "generator.loading.fetch_contributors"})
            await asyncio.sleep(0)
            contrib_resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/contributors?per_page=5",
                headers=GITHUB_HEADERS_LOCAL
            )
            repo_data["contributors"] = contrib_resp.json() if contrib_resp.status_code == 200 else []

            # --- TAHAP 2c: Scan struktur direktori ---
            yield make_event("status", {"key": "generator.loading.fetch_tree"})
            await asyncio.sleep(0)
            async def get_dir_async(dir_path: str = "") -> dict:
                r = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/contents/{dir_path}",
                    headers=GITHUB_HEADERS_LOCAL
                )
                r.raise_for_status()
                structure = {}
                for item in r.json():
                    if item["type"] == "dir":
                        structure[item["name"]] = await get_dir_async(f"{dir_path}/{item['name']}")
                    else:
                        structure[item["name"]] = "file"
                return structure
            repo_data["full_directory_structure"] = await get_dir_async()

            # --- TAHAP 2d: Baca file kunci ---
            yield make_event("status", {"key": "generator.loading.fetch_files"})
            await asyncio.sleep(0)
            root_resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/contents/",
                headers=GITHUB_HEADERS_LOCAL
            )
            root_resp.raise_for_status()
            root_contents = root_resp.json()
            repo_data["files"] = [i["name"] for i in root_contents if i["type"] == "file"]

            key_files = {"package.json": "", "requirements.txt": ""}
            for item in root_contents:
                if item["type"] == "file" and item["name"] in key_files:
                    fc = await client.get(item["url"], headers=GITHUB_HEADERS_LOCAL)
                    fc.raise_for_status()
                    fd = fc.json()
                    key_files[item["name"]] = (
                        decode_base64_content(fd["content"])
                        if fd.get("encoding") == "base64"
                        else fd.get("content", "")
                    )
            repo_data["key_files_content"] = key_files

        # --- TAHAP 3: Analisis & Build Prompt ---
        github_phase_done = True  # GitHub data successfully fetched
        yield make_event("status", {"key": "generator.loading.analyze"})
        await asyncio.sleep(0)
        prompt_messages = build_llm_prompt(repo_data, preferences)

        # --- TAHAP 4: Panggil AI ---
        yield make_event("status", {"key": "generator.loading.generate"})
        await asyncio.sleep(0)
        try:
            readme_content = await call_ai_assistant(prompt_messages, ai_config)
        except httpx.HTTPStatusError as ai_err:
            raw_detail = ""
            try:
                raw_detail = ai_err.response.json().get("error", {}).get("message") or ai_err.response.text
            except Exception:
                raw_detail = str(ai_err)
            
            # Map status codes to specific translation keys
            msg_key = "generator.errors.api.ai_call_failed"
            status = ai_err.response.status_code
            
            if status in [401, 403]:
                msg_key = "generator.errors.api.invalid_api_key"
            elif status == 429:
                msg_key = "generator.errors.api.rate_limit"
            elif status == 404:
                msg_key = "generator.errors.api.model_not_supported"
            elif status == 400:
                if "api_key" in raw_detail.lower() or "api key" in raw_detail.lower() or "not valid" in raw_detail.lower():
                    msg_key = "generator.errors.api.invalid_api_key"
                else:
                    msg_key = "generator.errors.api.model_not_supported"
            elif status in [500, 503]:
                if ai_config.provider == "ollama":
                    msg_key = "generator.errors.api.oom_error"
                elif "quota" in raw_detail.lower() or "limit" in raw_detail.lower():
                    msg_key = "generator.errors.api.rate_limit"

            yield make_event("error", {
                "message": msg_key,
                "detail": raw_detail,
                "provider": ai_config.provider,
                "model": ai_config.model,
            })
            return
        except HTTPException as ai_err:
            # Propagate HTTPException details raised inside call_ai_assistant
            msg_key = ai_err.detail if ai_err.detail.startswith("generator.errors.api") else "generator.errors.api.ai_call_failed"
            raw_detail = "" if ai_err.detail.startswith("generator.errors.api") else ai_err.detail
            yield make_event("error", {
                "message": msg_key,
                "detail": raw_detail,
                "provider": ai_config.provider,
                "model": ai_config.model,
            })
            return
        except Exception as ai_err:
            msg_key = "generator.errors.api.ai_call_failed"
            err_str = str(ai_err)
            if "memory" in err_str.lower() or "oom" in err_str.lower():
                msg_key = "generator.errors.api.oom_error"
            elif "unauthorized" in err_str.lower() or "api key" in err_str.lower() or "apikey" in err_str.lower():
                msg_key = "generator.errors.api.invalid_api_key"

            yield make_event("error", {
                "message": msg_key,
                "detail": err_str,
                "provider": ai_config.provider,
                "model": ai_config.model,
            })
            return

        # --- SELESAI: Kirim hasil README ---
        yield make_event("result", {"readme": readme_content})
        yield make_event("done", {})

    except httpx.HTTPStatusError as e:
        if github_phase_done:
            raw_detail = ""
            try:
                raw_detail = e.response.json().get("error", {}).get("message") or e.response.text
            except Exception:
                raw_detail = str(e)
            
            msg_key = "generator.errors.api.ai_call_failed"
            status = e.response.status_code
            if status in [401, 403]:
                msg_key = "generator.errors.api.invalid_api_key"
            elif status == 429:
                msg_key = "generator.errors.api.rate_limit"
            elif status == 404:
                msg_key = "generator.errors.api.model_not_supported"
            elif status == 400:
                if "api_key" in raw_detail.lower() or "api key" in raw_detail.lower() or "not valid" in raw_detail.lower():
                    msg_key = "generator.errors.api.invalid_api_key"
                else:
                    msg_key = "generator.errors.api.model_not_supported"
            elif status in [500, 503] and ai_config.provider == "ollama":
                msg_key = "generator.errors.api.oom_error"

            yield make_event("error", {
                "message": msg_key,
                "detail": raw_detail,
                "provider": ai_config.provider,
                "model": ai_config.model,
            })
        elif e.response.status_code == 404:
            yield make_event("error", {"message": "generator.errors.api.repo_not_found"})
        else:
            yield make_event("error", {"message": "generator.errors.api.fetch_failed"})
    except HTTPException as e:
        if github_phase_done:
            msg_key = e.detail if e.detail.startswith("generator.errors.api") else "generator.errors.api.ai_call_failed"
            raw_detail = "" if e.detail.startswith("generator.errors.api") else e.detail
            yield make_event("error", {
                "message": msg_key,
                "detail": raw_detail,
                "provider": ai_config.provider,
                "model": ai_config.model
            })
        else:
            yield make_event("error", {"message": e.detail})
    except Exception as e:
        print(f"Unhandled stream error: {e}")
        msg_key = "generator.errors.api.internal_error"
        if github_phase_done:
            msg_key = "generator.errors.api.ai_call_failed"
            err_str = str(e)
            if "memory" in err_str.lower() or "oom" in err_str.lower():
                msg_key = "generator.errors.api.oom_error"
            elif "unauthorized" in err_str.lower() or "api key" in err_str.lower():
                msg_key = "generator.errors.api.invalid_api_key"
            
            yield make_event("error", {
                "message": msg_key,
                "detail": err_str,
                "provider": ai_config.provider,
                "model": ai_config.model
            })
        else:
            yield make_event("error", {"message": msg_key, "detail": str(e)})


@app.post("/generate-readme")
async def generate_readme_api(github_url_data: GitHubUrl):
    """Endpoint untuk menghasilkan README.md dari URL GitHub via SSE streaming."""
    github_url = github_url_data.githubUrl.strip()

    if not GITHUB_URL_REGEX.match(github_url):
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url")

    return StreamingResponse(
        _readme_event_stream(github_url, github_url_data.preferences, github_url_data.aiConfig),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.post("/prepare-prompt")
async def prepare_prompt_api(github_url_data: GitHubUrl):
    """
    Fetches GitHub repo data and builds the LLM prompt messages list.
    Used by the frontend when calling local AI providers (Ollama, 9Router)
    directly from the browser — the cloud backend handles only the GitHub
    scraping step, then the browser calls localhost AI on its own.
    """
    github_url = github_url_data.githubUrl.strip()

    if not GITHUB_URL_REGEX.match(github_url):
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url")

    repo_data = await fetch_github_data(github_url, GITHUB_PAT)
    prompt_messages = build_llm_prompt(repo_data, github_url_data.preferences)

    return {"messages": prompt_messages}


@app.post("/verify-connection")
async def verify_connection(request: VerifyConnectionRequest):
    """Verify AI provider connection and return step-by-step logs."""
    cfg = request.aiConfig
    logs = []
    try:
        logs.append(f"[INFO] Memulai verifikasi untuk provider: {cfg.provider.upper()}...")
        logs.append(f"[INFO] Model target: {cfg.model}")

        if cfg.provider == "ollama":
            base = cfg.ollamaUrl.rstrip("/")
            logs.append(f"[INFO] Menghubungi Ollama di {base}/api/tags...")
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{base}/api/tags", timeout=10.0)
                resp.raise_for_status()
                data = resp.json()
                model_names = [m["name"] for m in data.get("models", [])]
                logs.append(f"[SUCCESS] Terhubung ke Ollama!")
                if model_names:
                    logs.append(f"[INFO] Model tersedia: {', '.join(model_names)}")
                    if cfg.model not in model_names:
                        logs.append(f"[WARN] Model '{cfg.model}' tidak ditemukan. Pastikan sudah di-pull.")
                    else:
                        logs.append(f"[SUCCESS] Model '{cfg.model}' siap digunakan.")
                else:
                    logs.append("[WARN] Tidak ada model yang terpasang di Ollama.")
            return {"status": "success", "logs": logs}

        elif cfg.provider == "nine_router":
            base = cfg.nineRouterUrl.rstrip("/")
            logs.append(f"[INFO] Menghubungi 9Router di {base}/v1/models...")
            async with httpx.AsyncClient() as client:
                headers = {}
                if cfg.apiKey:
                    headers["Authorization"] = f"Bearer {cfg.apiKey}"
                resp = await client.get(f"{base}/v1/models", headers=headers, timeout=10.0)
                resp.raise_for_status()
                data = resp.json()
                models = data.get("data", [])
                model_names = [m["id"] for m in models if "id" in m]
                logs.append(f"[SUCCESS] Terhubung ke 9Router!")
                if model_names:
                    logs.append(f"[INFO] Model tersedia: {', '.join(model_names)}")
                    if cfg.model not in model_names:
                        logs.append(f"[WARN] Model '{cfg.model}' tidak terdaftar di 9Router.")
                    else:
                        logs.append(f"[SUCCESS] Model '{cfg.model}' siap digunakan.")
                else:
                    logs.append("[WARN] Tidak ada model aktif di 9Router.")
            return {"status": "success", "logs": logs}

        elif cfg.provider in ["openai", "groq", "deepseek", "claude", "gemini_custom", "mistral", "openrouter"]:
            if not cfg.apiKey:
                logs.append("[ERROR] API Key tidak boleh kosong.")
                return {"status": "error", "logs": logs}

            logs.append("[INFO] Mengirim permintaan tes ke API...")
            test_messages = [
                {"role": "user", "content": "Reply with the single word: OK"}
            ]
            if cfg.provider == "openai":
                result = await call_openai_api(test_messages, cfg.apiKey, cfg.model)
            elif cfg.provider == "claude":
                result = await call_claude_api(test_messages, cfg.apiKey, cfg.model)
            elif cfg.provider == "groq":
                result = await call_groq_api(test_messages, cfg.apiKey, cfg.model)
            elif cfg.provider == "deepseek":
                result = await call_deepseek_api(test_messages, cfg.apiKey, cfg.model)
            elif cfg.provider == "mistral":
                result = await call_mistral_api(test_messages, cfg.apiKey, cfg.model)
            elif cfg.provider == "openrouter":
                result = await call_openrouter_api(test_messages, cfg.apiKey, cfg.model)
            else:  # gemini_custom
                result = await call_google_ai(test_messages, [cfg.apiKey])

            logs.append(f"[SUCCESS] Koneksi berhasil! Respon API diterima.")
            logs.append(f"[SUCCESS] Model '{cfg.model}' siap digunakan.")
            return {"status": "success", "logs": logs}

        else:  # default
            logs.append("[INFO] Menggunakan konfigurasi default (Gemini API Key sistem).")
            if not GOOGLE_API_KEYS:
                logs.append("[ERROR] Tidak ada Google API Key yang terkonfigurasi di server.")
                return {"status": "error", "logs": logs}
            logs.append(f"[INFO] {len(GOOGLE_API_KEYS)} API Key sistem tersedia.")
            logs.append("[SUCCESS] Konfigurasi default aktif dan siap digunakan.")
            return {"status": "success", "logs": logs}

    except httpx.ConnectError:
        logs.append(f"[ERROR] Koneksi ditolak (Connection Refused). Pastikan service aktif dan URL benar.")
        return {"status": "error", "logs": logs}
    except httpx.TimeoutException:
        logs.append("[ERROR] Koneksi timeout. Server tidak merespons dalam batas waktu.")
        return {"status": "error", "logs": logs}
    except httpx.HTTPStatusError as e:
        logs.append(f"[ERROR] HTTP {e.response.status_code}: {e.response.text[:200]}")
        return {"status": "error", "logs": logs}
    except Exception as e:
        logs.append(f"[ERROR] Kesalahan tidak terduga: {str(e)[:200]}")
        return {"status": "error", "logs": logs}


@app.post("/ollama-models")
async def get_ollama_models(request: OllamaModelsRequest):
    """Fetch list of installed models from local Ollama instance."""
    base = request.ollamaUrl.rstrip("/")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{base}/api/tags", timeout=8.0)
            resp.raise_for_status()
            data = resp.json()
            model_names = [m["name"] for m in data.get("models", [])]
            return {"models": model_names}
    except Exception:
        return {"models": []}

@app.post("/nine-router-models")
async def get_nine_router_models(request: NineRouterModelsRequest):
    """Fetch list of active models from local or custom 9Router instance."""
    base = request.nineRouterUrl.rstrip("/")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{base}/v1/models", timeout=8.0)
            resp.raise_for_status()
            data = resp.json()
            models = data.get("data", [])
            model_names = [m["id"] for m in models if "id" in m]
            return {"models": model_names}
    except Exception:
        return {"models": []}
