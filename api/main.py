from fastapi.responses import JSONResponse
import asyncio

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import httpx
import base64
import json
import re

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
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL") # Default ke deepseek/deepseek-chat-v3.1:free jika tidak disetel
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Pastikan variabel lingkungan ada
if not GITHUB_PAT:
    raise ValueError("GITHUB_PAT environment variable not set.")
if not OPENROUTER_KEY:
    raise ValueError("OPENROUTER_KEY environment variable not set.")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_PAT}",
    "Accept": "application/vnd.github.v3+json",
}

class GitHubUrl(BaseModel):
    githubUrl: str
    aiProvider: str = "google"  # Default to google

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
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

def parse_github_url(github_url: str) -> tuple[str, str, str]:
    """Menganalisis URL GitHub dan mengembalikan pemilik, repositori, dan jalur."""
    # Menghapus skema dan www. jika ada
    cleaned_url = github_url.replace("https://", "").replace("http://", "").replace("www.", "")
    parts = cleaned_url.split('/')

    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format.")

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
        raise HTTPException(status_code=400, detail="Invalid GitHub URL.")

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
                raise HTTPException(status_code=404, detail="Repositori GitHub tidak ditemukan.")
            raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat mengambil data GitHub: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Network error: {e}")
    return repo_data

def build_llm_prompt(repo_data: dict) -> list:
    """Membangun prompt yang komprehensif untuk LLM."""
    system_prompt = (
        "Anda adalah ahli dokumentasi. Tugas Anda adalah membuat file README.md yang lengkap dan profesional "
        "untuk proyek GitHub yang diberikan. README harus mencakup deskripsi proyek, fitur utama, "
        "teknologi yang digunakan, cara instalasi, cara penggunaan, dan kontribusi. "
        "Gunakan format Markdown yang jelas dan mudah dibaca. "
        "Sertakan emoji yang relevan untuk membuat README lebih menarik. "
        "Pastikan untuk menyertakan bagian 'Instalasi' dan 'Penggunaan' yang jelas berdasarkan file konfigurasi yang disediakan. "
        "Gunakan struktur direktori lengkap yang diberikan untuk mendeskripsikan struktur proyek secara akurat."
    )

    user_prompt = f"""
    Buatkan saya file README.md untuk proyek GitHub ini:

    URL Repositori: {repo_data.get("html_url", "Tidak tersedia")}
    Deskripsi Proyek: {repo_data.get("description", "Tidak ada deskripsi.")}
    Bahasa Utama: {repo_data.get("language", "Tidak diketahui.")}
    Struktur Direktori Lengkap:
    {json.dumps(repo_data.get("full_directory_structure", {}), indent=2)}
    Daftar File di Root: {', '.join(repo_data.get("files", []))}

    --- Konteks File Kunci ---
    """

    if repo_data["key_files_content"].get("package.json"):
        user_prompt += f"\n\nKonten package.json:\n```json\n{repo_data['key_files_content']['package.json']}\n```"
    if repo_data["key_files_content"].get("requirements.txt"):
        user_prompt += f"\n\nKonten requirements.txt:\n```text\n{repo_data['key_files_content']['requirements.txt']}\n```"

    user_prompt += f"""

--- Akhir Konteks ---

Buat README.md yang informatif dan menarik berdasarkan informasi di atas.
Fokus pada bagian 'Instalasi' dan 'Penggunaan' dengan instruksi yang jelas.
Deskripsikan struktur proyek secara akurat berdasarkan 'Struktur Direktori Lengkap' yang diberikan.
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

async def call_deepseek(prompt_messages: list, openrouter_key: str, openrouter_model: str) -> str:
    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": openrouter_model,
        "messages": prompt_messages
    }
    
    max_retries = 3
    base_delay = 2
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60.0)
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt) # 2s, 4s, 8s
                        print(f"Rate limit hit (429). Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        raise HTTPException(status_code=429, detail="Server AI sedang sibuk (Rate Limit). Coba beberapa saat lagi.")
                raise e
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error calling AI Provider: {str(e)}")

async def call_google_ai(prompt_messages: list, google_api_key: str) -> str:
    """Call Google AI Studio API directly (not through OpenRouter)"""
    # Convert OpenAI-style messages to Google's format
    # Google expects: {"contents": [{"parts": [{"text": "..."}]}]}
    contents = []
    for msg in prompt_messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
    
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
    base_delay = 2
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.post(url, json=payload, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                # Extract text from Google's response format
                return result["candidates"][0]["content"]["parts"][0]["text"]
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt)
                        print(f"Google AI rate limit hit (429). Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        raise HTTPException(status_code=429, detail="Google AI sedang sibuk (Rate Limit). Coba beberapa saat lagi.")
                raise HTTPException(status_code=e.response.status_code, detail=f"Google AI error: {e.response.text}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error calling Google AI: {str(e)}")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI README Generator Backend!"}



@app.post("/generate-readme")
async def generate_readme_api(github_url_data: GitHubUrl):
    """Endpoint untuk menghasilkan README.md dari URL GitHub."""
    github_url = github_url_data.githubUrl.strip()
    ai_provider = github_url_data.aiProvider.strip().lower()
    
    if not GITHUB_URL_REGEX.match(github_url):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL provided.")
    
    if ai_provider not in ["google", "openrouter"]:
        raise HTTPException(status_code=400, detail="Invalid AI provider. Choose 'google' or 'openrouter'.")

    url_parts = github_url.split('/')
    owner = url_parts[3]
    repo = url_parts[4].replace(".git", "") # Hapus .git jika ada

    try:
        github_data = await get_github_directory_contents(github_url, GITHUB_PAT)
        prompt_messages = build_llm_prompt(github_data)
        
        # Route to appropriate AI provider
        if ai_provider == "google":
            readme_content = await call_google_ai(prompt_messages, GOOGLE_API_KEY)
        else:  # openrouter
            readme_content = await call_deepseek(prompt_messages, OPENROUTER_KEY, OPENROUTER_MODEL)
        
        return {"readme": readme_content}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")



GITHUB_URL_REGEX = re.compile(r"^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+(\/)?$")