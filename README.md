![GitHub stars](https://img.shields.io/github/stars/rossihana/Readme-Generator?style=for-the-badge)
![License](https://img.shields.io/github/license/rossihana/Readme-Generator?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/rossihana/Readme-Generator?style=for-the-badge)

# Readme-Generator

Monorepo for AI Readme Generator. This project provides a robust and intuitive platform for generating comprehensive `README.md` files powered by artificial intelligence, facilitating efficient project documentation for developers.

✨ [Visit Live Demo](https://readmegeneratorai.vercel.app/) ✨

## Table of Contents

*   [💻 Tech Stack](#-tech-stack)
*   [✨ Features](#-features)
*   [📁 Directory Structure](#-directory-structure)
*   [⚙️ Installation](#-installation)
*   [🛠️ Configuration](#-configuration)
*   [🚀 Usage](#-usage)
*   [🤝 Contributing](#-contributing)
*   [👤 Authors](#-authors)
*   [🗺️ Roadmap](#-roadmap)
*   [❓ FAQ](#-faq)
*   [⚖️ License](#-license)

---

## 💻 Tech Stack

The `Readme-Generator` project leverages a modern monorepo architecture, combining a powerful backend API with a dynamic frontend user interface.

*   **Frontend:**
    *   ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) - Primary language for robust and scalable frontend development.
    *   ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) - A declarative, component-based JavaScript library for building user interfaces.
    *   ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) - A next-generation frontend tooling that provides an extremely fast development experience.
    *   ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) - Package manager for JavaScript dependencies.
    *   ![i18next](https://img.shields.io/badge/i18next-264653?style=for-the-badge&logo=i18next&logoColor=white) - Internationalization framework for multi-language support.

*   **Backend:**
    *   ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) - Core language for the API logic.
    *   ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) - A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
    *   ![Uvicorn](https://img.shields.io/badge/Uvicorn-FF6200?style=for-the-badge&logo=uvicorn&logoColor=white) - An ASGI web server, typically used with FastAPI for high-performance Python web applications.
    *   ![pip](https://img.shields.io/badge/pip-000000?style=for-the-badge&logo=pypi&logoColor=white) - Package installer for Python.

*   **Development & Tooling:**
    *   ![Concurrent-ly](https://img.shields.io/badge/Concurrently-FF9900?style=for-the-badge&logo=npm&logoColor=white) - Utility for running multiple commands concurrently.
    *   ![Playwright](https://img.shields.io/badge/Playwright-212121?style=for-the-badge&logo=playwright&logoColor=white) - A framework for reliable end-to-end testing.
    *   ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) - Platform for frontend deployment, used for continuous deployment.

---

## ✨ Features

The `Readme-Generator` is designed to streamline the documentation process for developers, offering a suite of powerful features:

*   **AI-Powered Content Generation:** Harnesses advanced AI models to generate comprehensive and contextually relevant `README.md` content based on user input, saving significant time and effort.
*   **Customizable Generation Parameters:** Provides flexible configuration options to tailor the generated READMEs, allowing users to specify project details, technology stack, features, installation steps, and more.
*   **Intuitive User Interface:** Features a user-friendly web interface (`GeneratorForm.tsx`) for easy input of project information, making the README generation process straightforward for all users.
*   **Real-time Preview:** Offers an instant preview (`ReadmeDisplay.tsx`) of the generated `README.md` content, allowing users to review and make adjustments before finalization.
*   **Multi-language Support:** Built with internationalization (`i18n.ts`) capabilities, supporting multiple languages (e.g., English, Indonesian via `locales/en.json`, `locales/id.json`) to cater to a global developer community.
*   **Modular Component Design:** The frontend is structured with reusable components (e.g., `AiConfigModal.tsx`, `LanguageSwitcher.tsx`, `InfoSection.tsx`), promoting maintainability and extensibility.
*   **Clear and Structured Output:** Generates `README.md` files with a professional, well-organized structure, enhancing readability and compliance with common documentation standards.
*   **Open-Source and Collaborative:** Designed as an open-source project to encourage community contributions, fostering continuous improvement and adaptation to evolving developer needs.

---

## 📁 Directory Structure

The project is organized as a monorepo, separating the frontend and backend components for clear development and deployment.

```
.
├── .gitignore
├── README.md
├── api/
│   ├── index.py
│   ├── main.py
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── .gitignore
│   ├── App.tsx
│   ├── README.md
│   ├── components/
│   │   ├── AiConfigModal.tsx
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

### Key Directories and Files:

*   **`/api`**: Contains the Python-based backend API.
    *   `main.py`: The primary entry point for the FastAPI application, handling AI-powered README generation requests.
    *   `requirements.txt`: Lists all Python dependencies required for the backend.
    *   `vercel.json`: Vercel configuration for deploying the API.
*   **`/frontend`**: Houses the React/TypeScript frontend application.
    *   `App.tsx`: The main React component that orchestrates the application's UI.
    *   `components/`: A collection of reusable React components (e.g., forms, modals, display areas).
    *   `locales/`: Stores JSON files for internationalization, enabling multi-language support.
    *   `package.json`: Manages frontend-specific npm dependencies and scripts.
    *   `vite.config.ts`: Configuration file for the Vite build tool.
    *   `vercel.json`: Vercel configuration for deploying the frontend.
*   **`package.json` (root)**: The monorepo's main package file, defining global scripts (e.g., `start`, `build`) and shared development dependencies.
*   **`README.md`**: This file, providing an overview of the entire project.

---

## ⚙️ Installation

To set up the `Readme-Generator` project locally, follow these detailed steps. Ensure you have the necessary prerequisites installed.

### Prerequisites

Before proceeding with the installation, ensure you have the following software installed on your system:

*   **Node.js**: Version 18.x or higher.
    *   Verify with: `node -v`
*   **npm**: Version 9.x or higher (comes with Node.js).
    *   Verify with: `npm -v`
*   **Python**: Version 3.9 or higher.
    *   Verify with: `python3 --version` or `python --version`
*   **pip**: Python's package installer (comes with Python).
    *   Verify with: `pip3 --version` or `pip --version`
*   **Git**: For cloning the repository.
    *   Verify with: `git --version`

### Step-by-Step Installation

1.  **Clone the Repository:**
    Start by cloning the `Readme-Generator` GitHub repository to your local machine:
    ```bash
    git clone https://github.com/rossihana/Readme-Generator.git
    cd Readme-Generator
    ```

2.  **Install Root Dependencies:**
    Install the top-level development dependencies required for the monorepo scripts (e.g., `concurrently`):
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    Navigate into the `frontend` directory and install its specific npm dependencies:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **Install Backend Dependencies:**
    Navigate into the `api` directory and install its Python dependencies using pip:
    ```bash
    cd api
    pip install -r requirements.txt
    cd ..
    ```

Upon successful completion of these steps, the project should be ready for configuration and local execution.

---

## 🛠️ Configuration

The `Readme-Generator` project requires minimal configuration to run locally. This section outlines how to set up environment variables and other relevant settings.

### Environment Variables

For the AI-powered generation, an API key for the underlying AI service is typically required. While not explicitly defined in the provided `package.json` or directory structure, it is standard practice to manage such sensitive information via environment variables.

1.  **Create a `.env` file:**
    In the root directory of the project, create a file named `.env`.

2.  **Add AI API Key:**
    Add your AI service API key to this file. Replace `YOUR_AI_API_KEY_HERE` with your actual key.
    ```env
    # .env
    AI_API_KEY=YOUR_AI_API_KEY_HERE
    ```
    _(Note: The specific environment variable name and its usage would be defined within the `api/main.py` or associated configuration files. If the AI service requires additional environment variables, they should also be added here.)_

### Frontend Configuration

The frontend application uses `constants.ts` and `metadata.json` for general settings and application metadata.

*   **`frontend/constants.ts`**:
    This file may contain static configuration values such as default language, application name, or other non-sensitive settings.
    ```typescript
    // frontend/constants.ts
    export const DEFAULT_LANGUAGE = 'en';
    export const APP_NAME = 'AI Readme Generator';
    // _(Add other specific frontend constants here if applicable)_
    ```
*   **`frontend/metadata.json`**:
    This file likely holds metadata about the application, which could be used for SEO, manifest files, or general information display.
    ```json
    // frontend/metadata.json
    {
      "name": "Readme-Generator",
      "short_name": "ReadmeGen",
      "description": "AI-powered tool to generate READMEs quickly.",
      "theme_color": "#ffffff",
      "background_color": "#ffffff",
      "display": "standalone",
      "start_url": "/",
      "icons": [
        // _(Add icon paths and sizes here)_
      ]
    }
    ```

### Backend Configuration

The backend `api` directory contains `vercel.json` for deployment-specific configurations when hosted on Vercel. For local development, configuration is primarily handled by `main.py` itself and the environment variables.

*   **`api/vercel.json`**:
    This file specifies how Vercel should deploy the Python API. It typically defines the build command and routes.
    ```json
    // api/vercel.json
    {
      "version": 2,
      "builds": [
        {
          "src": "index.py",
          "use": "@vercel/python"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "/api/index.py"
        }
      ]
    }
    ```
    _(Note: `index.py` is defined as the entry point here, which might act as a wrapper or main handler for the FastAPI application defined in `main.py` for Vercel deployment purposes.)_

Ensure all configurations are correctly set up before starting the application to guarantee full functionality.

---

## 🚀 Usage

Once the project dependencies are installed and configurations are complete, you can start the `Readme-Generator` application. This section provides instructions on how to run the application locally and interact with its features.

### Running the Application Locally

The project includes a convenient `npm start` script in the root `package.json` that simultaneously launches both the frontend and backend services.

1.  **Start the Application:**
    From the root directory of the project, execute the following command:
    ```bash
    npm start
    ```
    This command will:
    *   Start the frontend development server (using Vite) on `http://localhost:5173` (default Vite port).
    *   Start the backend API server (using Uvicorn) on `http://localhost:8000`.

    You should see output similar to this in your terminal:
    ```
    > readme-generator-monorepo@1.0.0 start
    > concurrently "npm run dev --prefix frontend" "uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload"

    [frontend]
    [frontend] > frontend@0.0.0 dev
    [frontend] > vite
    [frontend]
    [api] INFO:     Will watch for changes in these directories: ['/path/to/Readme-Generator/api']
    [api] INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
    [api] INFO:     Started reloader process [PID]
    [api] INFO:     Started server process [PID]
    [api] INFO:     Waiting for application startup.
    [frontend] VITE v5.3.1 ready in 405 ms
    [frontend]
    [frontend]   ➜  Local: http://localhost:5173/
    [frontend]   ➜  Network: use --host to expose
    [frontend]   ➜  press h + enter to show help
    [api] INFO:     Application startup complete.
    ```

2.  **Access the Application:**
    Open your web browser and navigate to the frontend URL:
    ```
    http://localhost:5173/
    ```
    You will be presented with the `Readme-Generator` user interface.

### Interacting with the Generator

The frontend provides an intuitive form to generate your README.

1.  **Input Project Details:**
    *   Fill in the `GeneratorForm.tsx` fields with details about your project, such as project name, description, features, technologies used, installation steps, and more.
    *   Utilize the `AiConfigModal.tsx` if available, to fine-tune AI generation parameters.

2.  **Select Language:**
    *   Use the `LanguageSwitcher.tsx` component to select your preferred language for the generated README (e.g., English or Indonesian).

3.  **Generate README:**
    *   Click the "Generate" button (or equivalent) within the `GeneratorForm.tsx`.
    *   The frontend will send your input to the backend API (`http://localhost:8000/api/generate-readme`, or similar endpoint defined in `api/main.py`).
    *   The backend processes the request using its AI capabilities and returns the generated Markdown content.

4.  **Review and Download:**
    *   The generated `README.md` content will be displayed in the `ReadmeDisplay.tsx` component in real-time.
    *   Review the content, make any necessary manual edits, and then download the `README.md` file to your project repository.

This interactive process allows for quick and efficient creation of high-quality project documentation.

---

## 🤝 Contributing

We welcome contributions from the community to make the `Readme-Generator` even better! Whether you're fixing bugs, adding new features, or improving documentation, your help is greatly appreciated.

Please follow these guidelines to ensure a smooth and effective contribution process.

### How to Contribute

1.  **Fork the Repository:**
    Start by forking the `Readme-Generator` repository to your GitHub account.

2.  **Clone Your Fork:**
    Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Readme-Generator.git
    cd Readme-Generator
    ```

3.  **Create a New Branch:**
    Create a new branch for your feature or bug fix. Use a descriptive name:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```

4.  **Set Up Local Environment:**
    Ensure your local development environment is set up as described in the [Installation](#-installation) section.

5.  **Make Your Changes:**
    Implement your changes, adhering to the project's coding style and best practices.

    *   **Frontend Changes:** Work within the `frontend/` directory.
    *   **Backend Changes:** Work within the `api/` directory.

6.  **Test Your Changes:**
    Before submitting a pull request, thoroughly test your changes.
    *   Run local tests: The project uses Playwright for end-to-end testing.
        ```bash
        # From the root directory
        npm test # (if a root test script is defined)
        # or specifically for playwright
        npx playwright test
        ```
    *   Ensure all existing tests pass and add new tests for any new features or bug fixes.

7.  **Commit Your Changes:**
    Write clear and concise commit messages. Each commit should represent a logical unit of work.
    ```bash
    git add .
    git commit -m "feat: Add new feature for X"
    # or
    git commit -m "fix: Resolve bug in Y component"
    ```

8.  **Push to Your Fork:**
    Push your local branch to your forked repository on GitHub:
    ```bash
    git push origin feature/your-feature-name
    ```

9.  **Create a Pull Request (PR):**
    *   Go to the original `Readme-Generator` repository on GitHub.
    *   You will see a prompt to create a new pull request from your recently pushed branch.
    *   Provide a clear title and detailed description of your changes in the PR.
    *   Reference any related issues (e.g., `Fixes #123`).

### Code Style and Standards

*   **TypeScript/React:** Follow standard TypeScript and React best practices. Use ESLint and Prettier for code formatting.
*   **Python/FastAPI:** Adhere to PEP 8 guidelines. Use a linter like Black or Flake8.
*   Ensure all code is well-commented where necessary.

### Issue Reporting

If you encounter any bugs or have feature requests, please open an issue on the GitHub repository. Provide as much detail as possible, including steps to reproduce bugs and clear descriptions for feature requests.

Thank you for contributing to `Readme-Generator`!

---

## 👤 Authors

This project is maintained and primarily developed by:

*   **rossihana** - [GitHub Profile](https://github.com/rossihana)

---

## 🗺️ Roadmap

The `Readme-Generator` project is continuously evolving. Here are some of the planned enhancements and future directions:

*   **Enhanced AI Model Integration:** Explore and integrate more advanced and specialized AI models to improve the quality and accuracy of generated README content.
*   **Template Customization:** Implement a feature allowing users to define and save their own README templates, providing greater flexibility.
*   **Advanced Configuration UI:** Develop a more sophisticated user interface for configuring AI generation parameters, including tone, verbosity, and specific section inclusions.
*   **Direct Repository Integration:** Enable direct integration with GitHub or other version control systems to automatically fetch project metadata and push generated READMEs.
*   **CLI Tool:** Develop a command-line interface (CLI) version for developers who prefer terminal-based workflows.
*   **Support for Additional Markdown Extensions:** Expand support for various Markdown extensions (e.g., Mermaid diagrams, custom badges) within the generated READMEs.
*   **Improved Error Handling and Feedback:** Enhance the user experience with more detailed error messages and clearer feedback during the generation process.
*   **Performance Optimizations:** Continuously optimize both frontend and backend for faster response times and improved resource utilization.
*   **Comprehensive API Documentation:** (For external developers if the API becomes public for programmatic use) Provide thorough documentation for interacting with the generation API directly.

We welcome suggestions and contributions from the community to help prioritize and implement these roadmap items!

---

## ❓ FAQ

This section addresses common questions about the `Readme-Generator` project.

**Q1: What is Readme-Generator?**
A1: Readme-Generator is an open-source, AI-powered tool designed to help developers quickly and efficiently create comprehensive and well-structured `README.md` files for their GitHub projects. It streamlines the documentation process by generating content based on user input and AI capabilities.

**Q2: How does the AI generation work?**
A2: The application takes your project details (name, description, features, technologies, etc.) as input through its web interface. This information is then sent to a backend API that utilizes an AI model to process the input and generate relevant Markdown content for your `README.md` file.

**Q3: Is an AI API key required?**
A3: Yes, for the AI-powered generation functionality, an API key for the underlying AI service is typically required. Please refer to the [Configuration](#-configuration) section for instructions on how to set this up using environment variables.

**Q4: What languages does the generator support?**
A4: The frontend application supports multiple languages for its user interface and can generate READMEs in various languages, currently including English and Indonesian, thanks to its internationalization (i18n) capabilities.

**Q5: Can I customize the generated README?**
A5: Absolutely. The `Readme-Generator` provides input fields and configuration options to guide the AI in generating content tailored to your project. After generation, you can also manually edit the previewed Markdown content before downloading.

**Q6: How can I run this project locally?**
A6: Detailed instructions for setting up and running the project locally are provided in the [Installation](#-installation) and [Usage](#-usage) sections. You will need Node.js, npm, Python, and pip installed.

**Q7: How can I contribute to this project?**
A7: We highly encourage contributions! Please refer to the [Contributing](#-contributing) section for guidelines on how to fork the repository, make changes, and submit pull requests.

**Q8: What if I encounter an issue or bug?**
A8: If you find any bugs or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/rossihana/Readme-Generator/issues). Provide a detailed description of the problem and steps to reproduce it.

---

## ⚖️ License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 rossihana

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
