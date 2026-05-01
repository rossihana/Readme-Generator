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
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Validasi variabel lingkungan
if not GITHUB_PAT:
    print("WARNING: GITHUB_PAT environment variable not set.")
if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY environment variable not set.")

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
            repo_data["description"] = repo_info.get("description", "Tidak ada deskripsi.")
            repo_data["language"] = repo_info.get("language", "Tidak diketahui.")
            repo_data["html_url"] = repo_info.get("html_url", f"https://github.com/{owner}/{repo}")

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
    toc_instr = "Buatkan daftar isi (Table of Contents) di bagian atas README dengan link jangkar yang berfungsi." if preferences.includeTOC else ""

    # Map Project Purpose
    purpose_key = (preferences.projectPurpose or "portfolio").lower()
    purpose_instructions = {
        "portfolio": "Tulis ini sebagai proyek portofolio atau profesional. Tonjolkan nilai jual, pengalaman, fitur unik, demo aplikasi, dan kemudahan penggunaan agar menarik bagi rekruter, client, atau publik.",
        "academic": "Tulis ini sebagai dokumentasi Tugas Akhir, skripsi, atau proyek akademik/research. Gunakan bahasa yang formal dan objektif. Hilangkan bahasa marketing (sales). Fokus pada penjelasan teori, metodologi riset, spesifikasi arsitektur teknis, dan hasil eksperimen secara rinci.",
        "opensource": "Tulis ini sebagai library open-source publik. Wajib memberikan panduan kontribusi yang jelas, environment setup untuk developer asing yang ingin berkolaborasi, dan wajib menyertakan referensi Lisensi."
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
        f"Anda adalah seorang Technical Writer ahli. Tugas Anda adalah membuat file README.md yang akurat, informatif, dan profesional "
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
        "2. Setiap seksi harus konsisten dengan 'Tingkat Detail per Seksi' yang telah ditentukan. "
        "Jangan mempersingkat atau memperpanjang konten secara tidak proporsional.\n"
        "3. Basekan seluruh konten teknis (instalasi, konfigurasi, dll.) pada data nyata dari file konfigurasi yang disediakan. "
        "JANGAN mengarang perintah atau dependensi yang tidak ada.\n"
        "4. Jika informasi untuk suatu seksi sangat minim atau tidak tersedia dari data repositori, "
        "tuliskan seksi tersebut dengan konten placeholder yang jelas, misalnya: "
        "'_(Tambahkan deskripsi di sini)_' atau '_(Belum tersedia)_'. "
        "Jangan lewati atau hapus seksi yang diminta.\n"
        "5. Output HARUS langsung dimulai dengan konten Markdown (diawali `#` atau badge). "
        "JANGAN sertakan kata pembuka seperti 'Tentu!', 'Berikut adalah', atau 'Semoga membantu'.\n"
    )

    user_prompt = f"""
    Buatkan saya file README.md untuk proyek GitHub ini:

    URL Repositori: {repo_data.get("html_url", "Tidak tersedia")}
    Deskripsi Proyek: {repo_data.get("description", "Tidak ada deskripsi.")}
    Bahasa Utama Proyek: {repo_data.get("language", "Tidak diketahui.")}
    Struktur Direktori Lengkap:
    {json.dumps(repo_data.get("full_directory_structure", {}), indent=2)}
    Daftar File di Root: {', '.join(repo_data.get("files", []))}
    """

    # Add specific instructions for advanced sections
    if "Badges" in final_sections:
        user_prompt += "\n- Badges: Buatkan badge status menggunakan Shields.io (build, license, version, stars) menggunakan URL repo ini."
    if "Tech Stack" in final_sections:
        user_prompt += "\n- Tech Stack: List framework dan library utama yang ditemukan di file konfigurasi."
    if "Directory Structure" in final_sections:
        user_prompt += "\n- Directory Structure: Berikan gambaran pohon direktori yang rapi dan penjelasan singkat folder utama."

    # Logo & Screenshot
    if preferences.logoUrl:
        user_prompt += f"\nLogo URL: {preferences.logoUrl}"
    if preferences.screenshotUrl:
        user_prompt += f"\nScreenshot/Demo URL: {preferences.screenshotUrl}"

    user_prompt += "\n\n--- Konteks File Kunci ---"

    if repo_data["key_files_content"].get("package.json"):
        user_prompt += f"\n\nKonten package.json:\n```json\n{repo_data['key_files_content']['package.json']}\n```"
    if repo_data["key_files_content"].get("requirements.txt"):
        user_prompt += f"\n\nKonten requirements.txt:\n```text\n{repo_data['key_files_content']['requirements.txt']}\n```"

    user_prompt += f"""

--- Akhir Konteks ---

Buat README.md yang informatif dan menarik dalam {selected_language} berdasarkan informasi di atas.
WAJIB ikuti urutan seksi ini: {', '.join(final_sections)}.
{f"Pastikan untuk menyertakan instruksi 'Instalasi' dan 'Penggunaan' yang jelas." if "Installation" in preferences.includeSections or "Usage" in preferences.includeSections else ""}
Deskripsikan struktur proyek secara akurat berdasarkan 'Struktur Direktori Lengkap' yang diberikan.
"""

    if preferences.logoUrl:
        user_prompt += f"\nTempatkan logo dari URL {preferences.logoUrl} di bagian paling atas README."
    if preferences.screenshotUrl:
        user_prompt += f"\nTempatkan screenshot/demo dari URL {preferences.screenshotUrl} setelah deskripsi proyek atau di bagian yang sesuai."

    user_prompt += """
PENTING: Jangan berikan teks apapun selain konten Markdown. Jangan ada kalimat pembuka seperti 'Tentu, ini hasil generasinya'. Selalu mulai langsung dengan `# Judul Proyek` atau konten README.
JANGAN sertakan bagian yang tidak ada dalam daftar yang diminta di atas (kecuali License yang WAJIB selalu ada).
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

async def call_google_ai(prompt_messages: list, google_api_key: str) -> str:
    """Call Google AI Studio API directly (not through OpenRouter)"""
    # Google Gemini does NOT support 'system' role.
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
    
    # Use gemini-2.5-flash as default model
    model = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={google_api_key}"
    
    max_retries = 3
    base_delay = 10  # 10s, 20s between retries to respect free tier RPM
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.post(url, json=payload, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                # Extract text from Google's response format
                return result["candidates"][0]["content"]["parts"][0]["text"]
            except httpx.HTTPStatusError as e:
                # Handle Rate Limit (429) and Service Unavailable (503) with Retry
                if e.response.status_code in [429, 503]:
                    # Log the actual response body to understand the root cause
                    try:
                        err_body = e.response.json()
                        print(f"[DEBUG] Google {e.response.status_code} response body: {err_body}")
                    except Exception:
                        print(f"[DEBUG] Google {e.response.status_code} raw body: {e.response.text[:500]}")
                    
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt)
                        reason = "rate limit (429)" if e.response.status_code == 429 else "service busy (503)"
                        print(f"Google AI {reason} hit. Retrying in {wait_time}s... (Attempt {attempt + 1})")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        error_key = "generator.errors.api.quota" if e.response.status_code == 429 else "generator.errors.api.busy"
                        raise HTTPException(status_code=e.response.status_code, detail=error_key)
                
                # Default safety: parse JSON if possible, otherwise return generic unknown
                try:
                    err_json = e.response.json()
                    err_msg = err_json.get("error", {}).get("message", "generator.errors.api.unknown")
                    raise HTTPException(status_code=e.response.status_code, detail="generator.errors.api.unknown")
                except:
                    raise HTTPException(status_code=e.response.status_code, detail="generator.errors.api.unknown")

            except Exception as e:
                # Log the actual internal error for debugging but show user-friendly msg
                print(f"Internal Error in call_google_ai: {str(e)}")
                raise HTTPException(status_code=500, detail="generator.errors.api.unknown")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI README Generator Backend!"}



@app.post("/generate-readme")
async def generate_readme_api(github_url_data: GitHubUrl):
    """Endpoint untuk menghasilkan README.md dari URL GitHub."""
    github_url = github_url_data.githubUrl.strip()
    
    if not GITHUB_URL_REGEX.match(github_url):
        raise HTTPException(status_code=400, detail="generator.errors.api.invalid_url")
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="generator.errors.api.no_google_key")

    try:
        github_data = await get_github_directory_contents(github_url, GITHUB_PAT)
        prompt_messages = build_llm_prompt(github_data, github_url_data.preferences)
        readme_content = await call_google_ai(prompt_messages, GOOGLE_API_KEY)
        return {"readme": readme_content}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="generator.errors.api.internal_error")
