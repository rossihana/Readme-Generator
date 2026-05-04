![GitHub stars](https://img.shields.io/github/stars/rossihana/Readme-Generator?style=for-the-badge)
![License](https://img.shields.io/github/license/rossihana/Readme-Generator?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/rossihana/Readme-Generator?style=for-the-badge)

# Readme-Generator

Monorepo for AI Readme Generator

This project provides an AI-powered solution for generating comprehensive and professional `README.md` files. Designed as a public open-source tool, it aims to streamline the documentation process for developers, fostering better project visibility and collaboration. The monorepo structure ensures a clear separation between the frontend user interface and the backend API, facilitating independent development and deployment while maintaining a cohesive project.

## Table of Contents

*   [#-tech-stack](#-tech-stack)
*   [#-features](#-features)
*   [#-directory-structure](#-directory-structure)
*   [#-installation](#-installation)
*   [#-configuration](#-configuration)
*   [#-usage](#-usage)
*   [#-contributing](#-contributing)
*   [#-authors](#-authors)
*   [#-roadmap](#-roadmap)
*   [#-faq](#-faq)
*   [#-license](#-license)

---

## 💻 Tech Stack

The `Readme-Generator` project is built as a monorepo, leveraging a robust set of technologies for both its frontend and backend components, ensuring a scalable, maintainable, and highly interactive application.

**Frontend:**
*   **TypeScript** ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) - Primary language for enhanced type safety and developer experience.
*   **React** ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) - A declarative, efficient, and flexible JavaScript library for building user interfaces.
*   **Vite** ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) - A next-generation frontend tooling that provides an extremely fast development experience.
*   **i18n** - For internationalization, supporting multiple languages.

**Backend:**
*   **Python** ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) - The foundational language for the API.
*   **FastAPI** ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) - A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **Uvicorn** ![Uvicorn](https://img.shields.io/badge/uvicorn-black?style=for-the-badge&logo=uvicorn) - An ASGI web server, used to run the FastAPI application.

**Monorepo & Development Tools:**
*   **Concurrentl**y ![Concurrently](https://img.shields.io/badge/concurrently-black?style=for-the-badge) - Used to run multiple commands concurrently, essential for monorepo development.
*   **Playwright** ![Playwright](https://img.shields.io/badge/playwright-212B36?style=for-the-badge&logo=playwright&logoColor=white) - A robust framework for end-to-end testing of web applications.

**Deployment:**
*   **Vercel** ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) - Platform for frontend and serverless function deployment.

---

## ✨ Features

The `Readme-Generator` is engineered with developers in mind, offering a suite of capabilities to simplify and enhance the creation of project documentation.

*   **AI-Powered README Generation:** Leverage advanced AI models to generate comprehensive and contextually relevant `README.md` content based on project details and user input.
*   **Interactive User Interface:** A modern and intuitive frontend built with React and TypeScript provides a seamless experience for inputting project information and customizing README output.
*   **Multi-Language Support:** The frontend is internationalized (i18n), supporting multiple languages (currently English and Indonesian) to cater to a global developer community.
*   **Customizable Output:** Users can specify various sections, badges, and content preferences to tailor the generated README to their project's specific needs.
*   **Real-time Preview:** Instantly view changes and generated content as you input information, allowing for quick iterations and adjustments.
*   **Modular Architecture:** A clear monorepo separation between the frontend (React/Vite) and backend (FastAPI/Python) ensures maintainability, scalability, and independent development cycles.
*   **Robust API Design:** The backend API is built with FastAPI, providing a high-performance, well-documented, and extensible interface for README generation logic.
*   **Automated End-to-End Testing:** Comprehensive usability tests using Playwright ensure the application's functionality and user experience remain consistent and reliable.
*   **Easy Content Integration:** Generated README content can be easily copied and integrated into any GitHub repository or project documentation.

---

## 📂 Directory Structure

This project is structured as a monorepo, organizing the frontend and backend components into separate directories for clarity and independent management.

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
├── package.json
├── playwright.config.ts
└── tests/
    └── usability.spec.ts
```

*   **`/api`**: Contains the Python-based backend API built with FastAPI.
    *   `main.py`: The primary entry point for the FastAPI application.
    *   `requirements.txt`: Lists all Python dependencies for the backend.
    *   `vercel.json`: Vercel configuration for deploying the API as a serverless function.
*   **`/frontend`**: Houses the React and TypeScript-based user interface.
    *   `App.tsx`, `index.tsx`: Main application components and entry points.
    *   `components/`: Reusable React components such as `GeneratorForm`, `ReadmeDisplay`, `LanguageSwitcher`, etc.
    *   `locales/`: JSON files containing translation strings for internationalization (e.g., `en.json`, `id.json`).
    *   `package.json`: Frontend-specific dependencies and scripts.
    *   `vite.config.ts`: Configuration for Vite, the frontend build tool.
    *   `vercel.json`: Vercel configuration for deploying the frontend.
*   **`/tests`**: Contains end-to-end tests for the application.
    *   `usability.spec.ts`: Playwright test files ensuring core functionalities and user flows.
*   **`package.json` (root)**: Monorepo-level dependencies and scripts, including `concurrently` for running frontend and backend simultaneously, and Playwright for testing.
*   **`playwright.config.ts`**: Configuration file for Playwright end-to-end testing.

---

## ⚙️ Installation

To set up the `Readme-Generator` project locally, follow these steps. This project requires Node.js (with npm/Yarn/pnpm) and Python (with pip) to be installed on your system.

### Prerequisites

Ensure you have the following installed:

*   **Node.js**: Version 18.x or higher.
    ```bash
    node -v
    npm -v
    ```
*   **Python**: Version 3.9 or higher.
    ```bash
    python3 --version
    pip3 --version
    ```
*   **Git**: For cloning the repository.
    ```bash
    git --version
    ```

### Step-by-Step Installation

1.  **Clone the Repository:**
    Start by cloning the `Readme-Generator` repository to your local machine.
    ```bash
    git clone https://github.com/rossihana/Readme-Generator.git
    cd Readme-Generator
    ```

2.  **Install Root Dependencies:**
    Navigate to the root of the cloned repository and install the monorepo-level dependencies. These include tools like `concurrently` and `@playwright/test`.
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Install Frontend Dependencies:**
    Navigate into the `frontend` directory and install its specific dependencies.
    ```bash
    cd frontend
    npm install
    # or yarn install
    # or pnpm install
    cd ..
    ```

4.  **Install Backend Dependencies:**
    Navigate into the `api` directory and install the Python dependencies using `pip`. It is highly recommended to use a virtual environment.
    ```bash
    cd api
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
    pip install -r requirements.txt
    cd ..
    ```
    *(Optional but recommended)*: Deactivate the virtual environment when you are done working with the backend dependencies:
    ```bash
    deactivate
    ```

You have now successfully installed all the necessary components for the `Readme-Generator` project.

---

## 🛠️ Configuration

The `Readme-Generator` project involves configuration across both its frontend and backend components, as well as deployment settings for Vercel.

### Environment Variables

For sensitive information, such as API keys for the AI models, environment variables are crucial. While not explicitly detailed in the provided `package.json`, an "AI Readme Generator" will likely require these.

1.  **Backend (`api`):**
    Create a `.env` file in the `api` directory.
    ```
    # Example for AI API key (replace with actual key)
    AI_API_KEY=your_ai_service_api_key
    ```
    You will need to load these environment variables within your `main.py` (e.g., using `python-dotenv`).

2.  **Frontend (`frontend`):**
    For frontend environment variables, Vite typically uses `VITE_` prefixed variables. Create a `.env` file in the `frontend` directory.
    ```
    # Example for backend API URL
    VITE_API_URL=http://localhost:8000/api
    ```
    These variables are exposed to your frontend code.

### Vercel Deployment Configuration

The project includes `vercel.json` files in both the `api` and `frontend` directories, indicating its setup for deployment on Vercel.

*   **`frontend/vercel.json`**: Configures how the frontend application is built and served by Vercel. This typically involves specifying the build command and output directory.
    ```json
    {
      "framework": "vite",
      "installCommand": "npm install",
      "buildCommand": "npm run build",
      "outputDirectory": "dist"
    }
    ```
    _(Add specific details if available, otherwise use general structure)_

*   **`api/vercel.json`**: Configures the Python backend to be deployed as a serverless function on Vercel.
    ```json
    {
      "runtime": "python@3.9",
      "buildCommand": "pip install -r requirements.txt",
      "functions": {
        "index.py": {
          "runtime": "python3.9"
        }
      }
    }
    ```
    _(Add specific details if available, otherwise use general structure. Note: `uvicorn api.main:app` suggests `main.py` is the entry, but `index.py` is listed in vercel.json. Assuming `index.py` is a Vercel-specific entry point that imports `main.py`.)_

Ensure that any environment variables required for production (e.g., `AI_API_KEY`) are configured in your Vercel project settings.

---

## 🚀 Usage

The `Readme-Generator` is designed for ease of use, allowing developers to quickly generate professional READMEs. This section details how to run the application locally and provides an overview of its usage.

### Running the Application Locally

To start both the frontend development server and the backend API server concurrently, use the `start` script defined in the root `package.json`:

1.  **Ensure all dependencies are installed** as described in the [Installation](#-installation) section.
2.  **Activate Python virtual environment for backend (if not already active):**
    ```bash
    cd api
    source .venv/bin/activate # On Windows, use `.venv\Scripts\activate`
    cd ..
    ```
3.  **Start the development servers:**
    From the root directory of the project:
    ```bash
    npm run start
    ```
    This command will:
    *   Start the frontend development server (`npm run dev --prefix frontend`), typically accessible at `http://localhost:5173`.
    *   Start the backend FastAPI server (`uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload`), accessible at `http://localhost:8000`.

    You should see output from both the frontend (Vite) and backend (Uvicorn) indicating that they are running.

4.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:5173` (or the address indicated by the frontend server).

### Building the Project for Production

To create a production-ready build of the frontend, use the `build` script:

```bash
npm run build
```

This command will:
*   Navigate into the `frontend` directory.
*   Install frontend dependencies (if not already installed).
*   Run the frontend build process (`npm run build`).
*   Create a `dist` directory in the root of the project and copy all built frontend assets into it.

The `dist` directory will then contain all static files ready for deployment.

### Generating a README (Conceptual Usage)

Once the application is running:

1.  **Navigate to the Frontend:** Open your browser to `http://localhost:5173`.
2.  **Input Project Details:** Use the interactive form (likely `GeneratorForm.tsx`) to provide information about your project, such as:
    *   Project Name
    *   Short Description
    *   Key Features
    *   Technologies Used
    *   Installation Instructions
    *   Usage Examples
    *   Contributing Guidelines
    *   License Information
3.  **Select Options:** Choose preferred README sections, badge types, and other customization options.
4.  **Generate README:** Click the "Generate" button (or similar) to send your input to the backend API.
5.  **Review and Copy:** The generated `README.md` content will be displayed in a dedicated section (likely `ReadmeDisplay.tsx`). You can review it, make any final manual edits, and then copy the Markdown text to your clipboard for use in your GitHub repository.

#### Example Backend API Interaction (Conceptual)

While the primary interaction is via the frontend, developers can also directly interact with the backend API for testing or integration purposes.

**Request (e.g., using `curl` or a Python script):**
```bash
curl -X POST "http://localhost:8000/generate-readme" \
     -H "Content-Type: application/json" \
     -d '{
           "projectName": "My Awesome Project",
           "description": "A brief overview of my project.",
           "features": ["Feature A", "Feature B"],
           "techStack": ["Python", "React"],
           "license": "MIT"
         }'
```

**Response (example `README.md` content):**
```markdown
# My Awesome Project

A brief overview of my project.

## Features

* Feature A
* Feature B

## Tech Stack

* Python
* React

## License

MIT License
...
```
*(The actual API endpoint and request body would be defined in `api/main.py` and potentially `api/index.py` for Vercel serverless functions.)*

---

## 🤝 Contributing

We welcome contributions from the community to make the `Readme-Generator` even better! Whether it's bug fixes, new features, improved documentation, or enhanced AI models, your help is invaluable.

Please follow these guidelines to ensure a smooth contribution process.

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
    Create a new branch for your feature or bug fix. Use a descriptive name.
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```

4.  **Set Up Development Environment:**
    Follow the [Installation](#-installation) instructions to set up the project locally. Ensure both the frontend and backend are running correctly.

5.  **Make Your Changes:**
    *   **Frontend Changes (`frontend/`):**
        *   Write clean, modular React components and TypeScript code.
        *   Ensure new features are responsive and user-friendly.
        *   Add or update localization files (`frontend/locales/`) if your changes affect user-facing text.
    *   **Backend Changes (`api/`):**
        *   Implement new API endpoints or enhance existing AI generation logic using Python and FastAPI.
        *   Write efficient and secure code.
        *   Update `api/requirements.txt` if new Python packages are introduced.
    *   **Documentation Changes:**
        *   Update `README.md` in the root or `frontend/README.md` for specific component documentation.
        *   Ensure all new features are well-documented.

6.  **Test Your Changes:**
    *   Run unit tests (if any are added) and ensure all existing tests pass.
    *   Run end-to-end tests using Playwright:
        ```bash
        npm run test --prefix tests
        ```
    *   Manually test your changes in the browser to ensure they work as expected.

7.  **Commit Your Changes:**
    Write clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Add new AI model for README generation"
    # or
    git commit -m "fix: Resolve issue with language switcher"
    ```

8.  **Push to Your Fork:**
    ```bash
    git push origin feature/your-feature-name
    ```

9.  **Create a Pull Request (PR):**
    *   Go to your forked repository on GitHub.
    *   Click on "Compare & pull request" to open a new PR.
    *   Provide a detailed description of your changes, including why they are necessary and what problem they solve.
    *   Reference any related issues (e.g., `Closes #123`).

### Code Style

*   **TypeScript/React:** Adhere to standard TypeScript and React best practices. Use a linter (e.g., ESLint) and formatter (e.g., Prettier) if configured (though not explicitly in `package.json`, it's good practice).
*   **Python:** Follow PEP 8 guidelines for Python code.

### Issue Reporting

If you find a bug or have a feature request, please open an issue on the GitHub issue tracker.
*   **Bug Reports:** Provide clear steps to reproduce the bug, expected behavior, and actual behavior. Include screenshots or error messages if possible.
*   **Feature Requests:** Clearly describe the desired feature and its potential benefits.

We appreciate your contributions and look forward to collaborating with you!

---

## 👥 Authors

The `Readme-Generator` project is developed and maintained by the following individuals:

*   **rossihana** - Initial concept, development, and ongoing maintenance.
    *   GitHub: [@rossihana](https://github.com/rossihana)

---

## 🗺️ Roadmap

The development of `Readme-Generator` is an ongoing process. Here are some of the planned features and improvements for future releases:

*   **Enhanced AI Models:** Integrate more advanced and specialized AI models for even more intelligent and contextual README generation.
*   **More Templates and Styles:** Offer a wider variety of README templates and styling options to cater to diverse project needs and preferences.
*   **CLI Version:** Develop a command-line interface (CLI) tool for generating READMEs directly from the terminal, enabling integration into automated workflows.
*   **Deeper Integrations:** Explore integrations with popular development platforms (e.g., GitHub API for project metadata, issue trackers).
*   **Improved UI/UX:** Continuous enhancements to the user interface and overall user experience for a more intuitive and efficient generation process.
*   **Comprehensive Testing:** Expand the test suite to include more unit, integration, and end-to-end tests to ensure robust and reliable functionality.
*   **Localization Expansion:** Add support for additional languages beyond English and Indonesian.
*   **User Authentication:** Implement optional user authentication to save preferences and generated READMEs.

We welcome suggestions and contributions from the community to help shape the future of this project.

---

## ❓ FAQ

Here are some frequently asked questions about the `Readme-Generator` project.

**Q: What is the primary purpose of `Readme-Generator`?**
A: `Readme-Generator` aims to simplify and accelerate the creation of professional `README.md` files for developers by leveraging AI to generate comprehensive and customizable project documentation.

**Q: How does the AI generation work?**
A: _(Add description of how the AI processes input and generates output, e.g., "The AI backend processes user input and project metadata, using natural language processing and generation models to construct a structured and informative README based on best practices.")_

**Q: Is `Readme-Generator` free to use?**
A: Yes, `Readme-Generator` is an open-source project released under the ISC License, making it free to use, modify, and distribute.

**Q: What languages does the frontend support?**
A: The frontend currently supports English and Indonesian, with plans to expand to more languages in the future.

**Q: Can I contribute to this project?**
A: Absolutely! We highly encourage contributions. Please refer to the [Contributing](#-contributing) section for detailed guidelines on how to get involved.

**Q: How do I report a bug or suggest a feature?**
A: Please open an issue on our GitHub repository. For bug reports, include steps to reproduce, and for feature requests, describe the desired functionality and its benefits.

**Q: What are the main technologies used in this project?**
A: The project uses TypeScript, React, and Vite for the frontend, and Python with FastAPI and Uvicorn for the backend. Playwright is used for end-to-end testing, and `concurrently` manages the monorepo development.

---

## ⚖️ License

This project is licensed under the **ISC License**.

A short, permissive non-copyleft free software license.

```
ISC License (ISC)
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
For the full license text, please see the `LICENSE` file in the repository.