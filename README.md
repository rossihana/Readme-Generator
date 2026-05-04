![GitHub stars](https://img.shields.io/github/stars/rossihana/Readme-Generator?style=for-the-badge)
![License](https://img.shields.io/github/license/rossihana/Readme-Generator?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/rossihana/Readme-Generator?style=for-the-badge)

# Readme-Generator

Monorepo for AI Readme Generator. This project provides a robust and intuitive tool for effortlessly generating comprehensive and professional `README.md` files for your projects using artificial intelligence. Designed with developers in mind, it aims to streamline the documentation process, ensuring consistency and completeness across various repositories.

✨ [Visit the Live Demo](https://readmegeneratorai.vercel.app/) ✨

---

## 📖 Table of Contents

*   [🛠️ Tech Stack](#-tech-stack)
*   [✨ Features](#-features)
*   [📂 Directory Structure](#-directory-structure)
*   [🚀 Installation](#-installation)
*   [⚙️ Configuration](#-configuration)
*   [💡 Usage](#-usage)
*   [🤝 Contributing](#-contributing)
*   [👤 Authors](#-authors)
*   [🗺️ Roadmap](#-roadmap)
*   [❓ FAQ](#-faq)
*   [📜 License](#-license)

---

## 🛠️ Tech Stack

This project leverages a modern monorepo architecture, combining a powerful backend API with a dynamic frontend user interface.

### Frontend
*   **Language**: TypeScript ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
*   **Framework/Library**: React ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
*   **Build Tool**: Vite ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
*   **Package Manager**: npm ![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
*   **Internationalization**: i18next ![i18next](https://img.shields.io/badge/i18next-264653?style=for-the-badge&logo=i18next&logoColor=white)
*   **Testing**: Playwright ![Playwright](https://img.shields.io/badge/Playwright-212121?style=for-the-badge&logo=playwright&logoColor=white)

### Backend
*   **Language**: Python ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
*   **Web Framework**: FastAPI (Inferred) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
*   **ASGI Server**: Uvicorn (Inferred) ![Uvicorn](https://img.shields.io/badge/Uvicorn-222222?style=for-the-badge&logo=uvicorn&logoColor=white)
*   **Package Manager**: pip ![pip](https://img.shields.io/badge/pip-064883?style=for-the-badge&logo=pypi&logoColor=white)

### Development Tools
*   **Monorepo Management**: Concurrently ![Concurrently](https://img.shields.io/badge/Concurrently-FFCC00?style=for-the-badge)
*   **Deployment**: Vercel ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## ✨ Features

The Readme-Generator is engineered to provide a seamless experience for creating high-quality `README.md` files with minimal effort.

*   **AI-Powered Content Generation**: Utilizes advanced AI models to generate detailed and relevant content for your READMEs based on project inputs.
*   **Intuitive User Interface**: A clean and responsive frontend built with React and Vite allows for easy input and real-time preview of the generated README.
*   **Multi-language Support**: Supports multiple languages for the user interface and potentially for generated content, enhancing accessibility for a global audience.
*   **Modular Architecture**: Separated frontend and backend services ensure maintainability, scalability, and independent development.
*   **Real-time Preview**: Instantly view changes and generated content as you refine your project details, ensuring the output meets your expectations.
*   **Customizable Output**: Provides options to tailor the generated README sections, allowing users to include or exclude specific elements.
*   **Easy Integration**: Designed as an open-source tool, it encourages integration into existing development workflows and CI/CD pipelines.
*   **Comprehensive API**: The backend API is designed for extensibility, allowing developers to integrate its generation capabilities into other applications or scripts.

---

## 📂 Directory Structure

The project follows a monorepo structure, organizing the frontend and backend components into distinct directories.

```
.
├── .gitignore               # Standard Git ignore file for the monorepo
├── README.md                # This README file
├── api                      # Backend API services
│   ├── index.py             # Entry point for the API (potentially for Vercel serverless)
│   ├── main.py              # Main FastAPI application
│   ├── requirements.txt     # Python dependencies for the backend
│   └── vercel.json          # Vercel configuration for the API
├── frontend                 # Frontend application built with React and Vite
│   ├── .gitignore           # Git ignore specific to the frontend
│   ├── App.tsx              # Main React application component
│   ├── README.md            # Frontend-specific README
│   ├── components           # Reusable React components
│   │   ├── GeneratorForm.tsx    # Form for user input
│   │   ├── InfoSection.tsx      # Displays information or tips
│   │   ├── LanguageSwitcher.tsx # Component for switching UI languages
│   │   ├── ReadmeDisplay.tsx    # Renders the generated README content
│   │   └── icons.tsx            # Icon components
│   ├── constants.ts         # Frontend constant values
│   ├── i18n.ts              # i18next configuration for internationalization
│   ├── index.html           # Main HTML file for the frontend
│   ├── index.tsx            # Entry point for the React application
│   ├── locales              # Internationalization language files
│   │   ├── en.json          # English translations
│   │   └── id.json          # Indonesian translations
│   ├── metadata.json        # Frontend metadata (e.g., project details)
│   ├── package.json         # Frontend Node.js dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration for the frontend
│   ├── vercel.json          # Vercel configuration for the frontend
│   ├── vite-env.d.ts        # Vite environment type definitions
│   └── vite.config.ts       # Vite build configuration
└── package.json             # Root Node.js dependencies and scripts for the monorepo
```

---

## 🚀 Installation

To get the Readme-Generator up and running on your local machine, follow these steps. This monorepo requires both Node.js (for the frontend) and Python (for the backend).

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 18.x or higher (includes npm)
*   **Python**: Version 3.8 or higher
*   **pip**: Python package installer (usually comes with Python)

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone https://github.com/rossihana/Readme-Generator.git
cd Readme-Generator
```

### 2. Install Frontend Dependencies

Navigate into the `frontend` directory and install the Node.js dependencies:

```bash
cd frontend
npm install
cd .. # Return to the root directory
```

### 3. Install Backend Dependencies

Navigate into the `api` directory and install the Python dependencies:

```bash
cd api
pip install -r requirements.txt
cd .. # Return to the root directory
```

---

## ⚙️ Configuration

The Readme-Generator offers configuration options for both its frontend and backend components.

### 1. Environment Variables

The backend API may require specific environment variables, especially for AI model authentication or other service integrations.

Create a `.env` file in the `api` directory to store sensitive information.
```
# api/.env
OPENAI_API_KEY=your_openai_api_key_here
# _(Add other API keys or environment specific variables here)_
```
**Note**: The specific environment variables required will depend on the AI model chosen for content generation. Ensure you consult the documentation for your chosen AI service to obtain the necessary keys.

### 2. Frontend Configuration

The frontend application can be configured for aspects such as the backend API endpoint and default language.

*   **API Endpoint**: The `vite.config.ts` or `constants.ts` file in the `frontend` directory might contain the URL for the backend API. During local development, this typically points to `http://localhost:8000`.
    ```typescript
    // frontend/constants.ts (Example placeholder)
    export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    ```
    You can override this for production deployments via Vercel environment variables or by modifying `vite.config.ts`.
*   **Internationalization**: Language settings are managed in `frontend/i18n.ts` and the `frontend/locales` directory. You can add new language files (`.json`) and update `i18n.ts` to support additional languages.

### 3. Backend Configuration

The backend application, `api/main.py`, primarily uses FastAPI and Uvicorn.

*   **Port**: The default port for the backend is `8000`. This can be changed when running the `uvicorn` command (see Usage section).
*   **Reloading**: The `--reload` flag in the `uvicorn` command enables automatic code reloading during development.
*   **CORS**: Cross-Origin Resource Sharing (CORS) settings might be configured within `api/main.py` to allow the frontend application to communicate with the backend. For local development, it's often set to allow all origins (`*`) or specific frontend origins.

---

## 💡 Usage

This section guides you through running the Readme-Generator locally and interacting with its features.

### 1. Starting the Development Servers

The project is configured to run both the frontend and backend simultaneously using the `concurrently` package. From the root directory of the project, execute:

```bash
npm start
```

This command will:
*   Start the frontend development server, typically accessible at `http://localhost:5173`.
*   Start the backend API server using Uvicorn, typically accessible at `http://localhost:8000`.

You should see output similar to this in your terminal:

```
[frontend] > frontend@0.0.0 dev
[frontend] > vite

[api] INFO:     Will watch for changes in these directories: ['/path/to/your/project/api']
[api] INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
[api] INFO:     Started reloader process [PID]
[api] INFO:     Started server process [PID]
[api] INFO:     Waiting for application startup.
[api] INFO:     Application startup complete.
[frontend]
[frontend]   VITE v5.3.3  ready in 1234 ms
[frontend]
[frontend]   ➜  Local:   http://localhost:5173/
[frontend]   ➜  Network: use --host to expose
[frontend]   ➜  press h + enter to show help
```

### 2. Generating a README via the User Interface

1.  **Access the Frontend**: Open your web browser and navigate to `http://localhost:5173`.
2.  **Input Project Details**: On the left-hand side, you will find a form (`GeneratorForm.tsx`). Fill in the required fields such as:
    *   Project Name
    *   Short Description
    *   Key Features
    *   Technologies Used
    *   Installation Steps
    *   Usage Examples
    *   License Type
    *   Contributing Guidelines
    *   _(Any other fields provided by the UI)_
3.  **Generate**: Click the "Generate README" button. The frontend will send your inputs to the backend API.
4.  **View Output**: The generated `README.md` content will appear in the `ReadmeDisplay.tsx` component on the right-hand side of the page. You can review the content, copy it, and integrate it into your project.
5.  **Switch Language**: Use the `LanguageSwitcher.tsx` component to change the UI language between English and Indonesian (or other supported languages).

### 3. Interacting with the Backend API Directly (For Developers)

While the primary usage is through the UI, developers can also interact directly with the FastAPI backend.

The API typically provides a Swagger UI (OpenAPI documentation) for exploration. Once the backend server is running, you can access it at:

*   **Swagger UI**: `http://localhost:8000/docs`
*   **Redoc**: `http://localhost:8000/redoc`

**Example API Endpoint (Hypothetical)**:

Assuming an endpoint for README generation, you might make a POST request like this:

```bash
curl -X POST "http://localhost:8000/generate-readme" \
-H "Content-Type: application/json" \
-d '{
  "projectName": "My Awesome Project",
  "description": "A brief overview of the project.",
  "features": ["Feature A", "Feature B"],
  "technologies": ["Python", "FastAPI", "React"],
  "installation": "...",
  "usage": "...",
  "license": "MIT",
  "contributing": "..."
}'
```

The API will then return the generated Markdown content in the response.

```json
{
  "readme_content": "# My Awesome Project\n\nA brief overview of the project.\n\n## Features\n\n- Feature A\n- Feature B\n\n...",
  "status": "success"
}
```

Consult the `/docs` endpoint for the exact schema and available endpoints for the most accurate API interaction.

---

## 🤝 Contributing

We welcome contributions from the community to make the Readme-Generator even better! Your input, bug reports, feature requests, and code contributions are highly valued.

### How to Contribute

1.  **Fork the Repository**: Start by forking the `Readme-Generator` repository to your GitHub account.
2.  **Clone Your Fork**: Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Readme-Generator.git
    cd Readme-Generator
    ```
3.  **Create a New Branch**: Create a new branch for your feature or bug fix. Use a descriptive name:
    ```bash
    git checkout -b feature/your-feature-name
    # OR
    git checkout -b bugfix/issue-description
    ```
4.  **Set Up Development Environment**: Follow the [Installation](#-installation) guide to set up both the frontend and backend locally.
5.  **Make Your Changes**:
    *   For frontend changes, work within the `frontend/` directory.
    *   For backend changes, work within the `api/` directory.
    *   Ensure your code adheres to existing coding styles and best practices.
6.  **Test Your Changes**: Before submitting, thoroughly test your changes to ensure they work as expected and do not introduce regressions.
7.  **Commit Your Changes**: Write clear, concise commit messages.
    ```bash
    git commit -m "feat: Add new template option to generator"
    ```
8.  **Push to Your Fork**: Push your new branch to your forked repository on GitHub:
    ```bash
    git push origin feature/your-feature-name
    ```
9.  **Create a Pull Request**: Go to the original `Readme-Generator` repository on GitHub and open a new Pull Request from your forked branch to the `main` branch.
    *   Provide a clear title and detailed description of your changes.
    *   Reference any related issues (e.g., `Fixes #123`).

### Reporting Bugs

If you encounter any bugs, please open an issue on the [GitHub Issues](https://github.com/rossihana/Readme-Generator/issues) page. Include:
*   A clear and concise description of the bug.
*   Steps to reproduce the behavior.
*   Expected behavior.
*   Screenshots or error messages, if applicable.
*   Your operating system and browser versions.

### Feature Requests

Have an idea for a new feature or improvement? We'd love to hear it! Open an issue and describe your suggestion in detail.

---

## 👤 Authors

This project is primarily developed and maintained by:

*   **rossihana** - [GitHub Profile](https://github.com/rossihana)

---

## 🗺️ Roadmap

The Readme-Generator is under active development, and we have several exciting enhancements planned for the future.

*   **Expanded AI Model Support**: Integration with additional large language models (LLMs) to offer more diverse generation capabilities and quality.
*   **Customizable Templates**: Allow users to select from a variety of predefined README templates or even upload their own.
*   **CLI Tool**: Develop a command-line interface (CLI) for generating READMEs directly from the terminal, enabling easier integration into automated workflows.
*   **Advanced Configuration Options**: Provide more granular control over generated sections, styling, and content depth.
*   **User Accounts & Saved Projects**: Implement user authentication to allow saving generated READMEs and project configurations.
*   **Improved UI/UX**: Continuous refinement of the user interface for an even more intuitive and visually appealing experience.
*   **API Key Management**: Securely manage API keys for various AI services directly within the application (for self-hosted instances).
*   **Detailed Analytics & Feedback**: Gather anonymous usage data to understand popular features and areas for improvement.

---

## ❓ FAQ

Here are some frequently asked questions about the Readme-Generator.

*   **Q: What AI model does this generator use?**
    A: _(The specific AI model used is subject to change. Please refer to the backend API's documentation or source code for the current implementation details.)_
*   **Q: Can I use this generator for private projects?**
    A: Yes, absolutely. You can run the Readme-Generator locally and use it for any of your projects, public or private. No project data is stored unless explicitly configured to do so.
*   **Q: Are there any costs associated with using this tool?**
    A: The Readme-Generator itself is open-source and free to use. However, if the backend integrates with commercial AI services (e.g., OpenAI API), you might incur costs associated with their API usage. When running locally, you would typically provide your own API keys.
*   **Q: How can I add support for a new language?**
    A: To add a new language to the frontend, you need to create a new JSON file in the `frontend/locales` directory (e.g., `fr.json` for French) and update the `frontend/i18n.ts` configuration to include it.
*   **Q: I'm having trouble setting up the local environment. What should I do?**
    A: Please ensure you have all [prerequisites](#prerequisites) installed correctly. Double-check the installation steps for both frontend and backend dependencies. If the issue persists, open an issue on GitHub with detailed error messages and steps you've taken.

---

## 📜 License

This project is licensed under the ISC License.

```
ISC License

Copyright (c) 2026, rossihana

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