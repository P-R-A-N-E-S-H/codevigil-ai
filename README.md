# 🛡️ CodeVigil AI — Production-Grade AI Code Reviewer, Security Auditor & Interactive Debugger

![CodeVigil AI Banner](https://img.shields.io/badge/CodeVigil_AI-2.0_Pro-6366f1?style=for-the-badge&logo=shield&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-Vite_8-38bdf8?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_4-10b981?style=for-the-badge&logo=node.js&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-AI_Intelligence-a855f7?style=for-the-badge&logo=google&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-Diff_Engine-f59e0b?style=for-the-badge&logo=visualstudiocode&logoColor=white)

**CodeVigil AI** is a next-generation developer platform designed to review source code, eliminate security vulnerabilities, profile algorithmic complexity, generate automated unit tests, and debug software interactively in real time.

---

## ✨ Key Features & Capabilities

### 1. 📝 Monaco Code Editor & Intelligent Diff Engine
- **Full Monaco IDE Editor**: Syntax highlighting for **JavaScript**, **TypeScript**, **Python**, **C++**, **Go**, **Java**, **Rust**, and **SQL**.
- **Interactive Diff Views**: Switch instantly between **Code Editor**, **Side-by-Side Split Diff**, and **Unified Inline Diff** to compare original code against AI-refactored implementations.
- **Line Marker Navigation**: Detected bugs and security flaws are visually flagged with inline gutter markers and error highlights. Clicking any finding in the audit sidebar automatically jumps to and highlights the offending line.
- **One-Click Fix Application**: Instantly apply AI refactorings directly into your editor buffer.

### 2. 🤖 AI Code Quality Audit & Persona Analysis
- **Customizable AI Personas**:
  - 🏛️ **Senior Principal Architect**: Focuses on SOLID, DRY, and scalable system design patterns.
  - 🛡️ **Cybersecurity Red Team Lead**: Identifies OWASP Top 10 exploits, CWE weaknesses, and input validation vulnerabilities.
  - ⚡ **High-Performance Guru**: Optimizes nested loops, memory allocations, and concurrency bottlenecks.
  - 🧹 **Strict Quality Linter**: Removes dead code, lowers cyclomatic complexity, and enforces styling guidelines.
  - 🎓 **Staff Engineer Mentor**: Provides educational, beginner-friendly step-by-step guidance.
- **Health Grade & Score Gauge**: Animated circular gauge ($0-100$) and letter grades ($A+$, $A$, $B$, $C$, $D$, $F$).
- **Custom Linter Rules**: Define custom organizational guardrails (e.g. *"Enforce immutability"*, *"All async functions must have try-catch"*).

### 3. 🔒 Enterprise OWASP Security Scanner
- **CWE Vulnerability Classification**:
  - `CWE-89`: SQL Injection
  - `CWE-78`: Arbitrary Command Injection
  - `CWE-79`: Cross-Site Scripting (XSS)
  - `CWE-798`: Hardcoded API Keys & Secrets
  - `CWE-22`: Path Traversal
  - `CWE-327`: Weak Cryptography & Insecure Hashes
  - `CWE-502`: Insecure Deserialization
  - `CWE-120`: Memory Buffer Overflows
  - `CWE-1321`: Prototype Pollution
- **Exploit Analysis & Remediation**: Specific step-by-step guidance for hardening code.
- **PDF & Markdown Export**: Download enterprise audit reports in **PDF** or **Markdown** formats with a single click.

### 4. 📈 Live Complexity Profiler & Metrics Engine
- **Algorithmic Complexity Badges**: Estimated Big-O Time Complexity ($O(1)$, $O(N)$, $O(N \log N)$, $O(N^2)$, $O(2^N)$) and Space Complexity.
- **Cyclomatic Complexity Meter**: Calculates decision branches, conditional complexity, and maintainability index.
- **Technical Debt Clock**: Estimated minutes to refactor and remediate identified debt.
- **LOC Breakdown**: Visual stacked distribution of effective code lines, comment lines, and blank lines.

### 5. 💻 Subprocess Sandbox Code Runner
- **Isolated Execution**: Safely run **JavaScript** (Node.js) and **Python** code in an isolated subprocess sandbox.
- **Real-time Console**: Displays standard output (`stdout`), standard error (`stderr`), execution duration in milliseconds, and exit status.
- **Interactive Stdin**: Pass standard input arguments directly to the running program.

### 6. 🧪 Automated Unit Test Suite Generator
- **Multi-Framework Generation**: Auto-generates complete, ready-to-run unit tests for **Pytest**, **Jest / Vitest**, **JUnit 5**, **GoogleTest**, and **Go testing**.
- **Edge Case Coverage**: Automatically builds tests for happy paths, boundary conditions ($0$, empty arrays, `null`), and exception handling paths.
- **Copy & Export**: One-click copy or file download.

### 7. 💬 Interactive AI Pair Programmer Chat
- **Context-Aware Assistant**: Chat in real time with an AI engineer who has full visibility into your active editor code.
- **Quick Prompt Chips**: Fast prompts for *"Optimize to O(N)"*, *"Explain Logic"*, *"Check Concurrency"*, *"Add Docstrings"*, and *"Find Edge Cases"*.
- **Direct Code Insertion**: Insert suggested AI snippets straight into your editor with one click.

### 8. 🎨 Cyberpunk Glassmorphism Design System
- **5 Curated Themes**:
  - 🌌 *Cyberpunk Dark* (Neon indigo & cyan)
  - 🌊 *Midnight Navy* (Deep oceanic slate)
  - 🪐 *Slate Modern* (Minimalist graphite)
  - 🍂 *Monokai Pro* (Warm syntax & amber)
  - ☀️ *Clean Studio Light* (Crisp modern daytime studio)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- *(Optional)* **Python 3** installed locally if you wish to run Python sandbox snippets.

### Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Backend & Frontend together in development mode:**
   ```bash
   npm run dev
   ```
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 AI Engine Configuration

CodeVigil AI operates in **two modes**:
1. **Built-in Offline Heuristic Engine**: Zero API key required! Analyzes cyclomatic complexity, metrics, code quality rules, and OWASP vulnerability patterns locally with instant responses.
2. **Google Gemini AI 2.0 Mode**:
   - Open **Settings** (⚙️ top right in the UI).
   - Enter your [Google Gemini API Key](https://aistudio.google.com/app/apikey).
   - Key is stored securely in browser `localStorage` and sent over local headers.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status & AI configuration check |
| `GET` | `/api/snippets` | Returns library of sample bug snippets |
| `POST` | `/api/review` | Performs comprehensive AI code review & AST analysis |
| `POST` | `/api/chat` | Interactive pair programmer conversational assistant |
| `POST` | `/api/execute` | Executes code in isolated sandbox subprocess with timeout protection |
| `POST` | `/api/generate-tests` | Auto-generates unit test suites for target language |
| `POST` | `/api/metrics` | Calculates static metrics, Big-O estimates, LOC, and cyclomatic complexity |

---

## 📂 Project Architecture

```
AI Code Reviewer & Debugger/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Brand, snippet picker, language/persona selector
│   │   │   ├── EditorPanel.jsx      # Monaco Editor, Diff Editor, Line highlighting
│   │   │   ├── SandboxDrawer.jsx    # Terminal console, unit tests, custom rules
│   │   │   ├── AnalysisSidebar.jsx  # Multi-tab analysis container
│   │   │   ├── IssuesTab.jsx        # Health score gauge, issue cards, step explanations
│   │   │   ├── SecurityTab.jsx      # OWASP Top 10 vulnerabilities & PDF export
│   │   │   ├── MetricsTab.jsx       # Big-O complexity, cyclomatic meter, LOC bars
│   │   │   ├── ChatTab.jsx          # Interactive AI pair programmer chat
│   │   │   ├── SettingsModal.jsx    # Gemini Key, Model, Theme, and Editor settings
│   │   │   └── ToastContainer.jsx   # Toast notification system
│   │   ├── data/
│   │   │   └── defaultSnippets.js   # Preloaded multi-language bug scenarios
│   │   ├── services/
│   │   │   ├── api.js               # Unified API service
│   │   │   └── pdfExport.js         # PDF and Markdown audit report exporter
│   │   ├── App.jsx                  # Main application controller
│   │   ├── App.css                  # Layout, responsive styles & animations
│   │   ├── index.css                # CSS design system & theme engine
│   │   └── main.jsx                 # Entry point
│   ├── index.html                   # HTML5 template with Google Fonts
│   ├── vite.config.js               # Dev server & proxy configuration
│   └── package.json
│
├── server/                     # Node.js + Express Backend API
│   ├── src/
│   │   ├── analyzers/
│   │   │   ├── metricsEngine.js     # Halstead, Cyclomatic, and Big-O estimation
│   │   │   ├── securityScanner.js   # OWASP Top 10 & CWE vulnerability scanner
│   │   │   └── staticAnalyzer.js    # Quality rules heuristic engine
│   │   ├── data/
│   │   │   └── sampleSnippets.js    # Built-in sample test cases
│   │   ├── services/
│   │   │   ├── aiService.js         # Google Gemini integration & fallback
│   │   │   ├── codeRunner.js        # Safe subprocess execution sandbox
│   │   │   └── testGenerator.js     # Unit test generation service
│   │   └── server.js                # Express app & route definitions
│   └── package.json
│
└── package.json                # Root package with unified dev scripts
```

---

## 📜 License
MIT License. Built with ❤️ by the CodeVigil Team.
