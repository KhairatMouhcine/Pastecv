# 📄 PasteCV PRO — AI-Powered Batch Resume Parser

<div align="center">
  <img src="https://img.shields.io/badge/PHASE_1-DOCKER_FOUNDATION-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI_EXTRACTION-GROQ_LPU-orange?style=for-the-badge" />
</div>

---

### 🚀 The Problem
Recruiters receive CVs in inconsistent formats (PDF, DOCX, TXT) and waste hours extracting key information manually. Standard parsers often fail on complex layouts or require processing files one by one.

### 💡 Why It Matters
A recruiter reviewing **50 CVs/day** loses **~3 hours** just to formatting noise and manual data entry. PasteCV PRO eliminates this bottleneck with batch intelligence.

### ✨ Key Features
- 📦 **Batch Staging**: Upload and stage multiple files (.pdf, .docx, .txt) before processing them in a single AI pass.
- 🔍 **Multi-CV Detection**: Intelligent extraction that can identify multiple candidate profiles within a single document or text block.
- ⚡ **LPU™ Powered**: Leveraging Groq's Language Processing Units for sub-second inference speed.
- 📋 **Structured Data**: normalized JSON output (Name, Email, Skills, Experience, Education).
- 📑 **Report Export**: Generate and download professional PDF extraction reports instantly.

---

## 🛠️ Tech Stack
- **Backend**: Python / Flask (3.12)
- **AI**: Groq API (`llama-3.3-70b-versatile`)
- **Frontend**: React 18 / Vite / Bootstrap (HUD Workspace Design)
- **Containerization**: Docker (Multi-stage production builds)

## 📦 Project Structure
```text
.
├── backend/            # Flask API, PDF/DOCX Parsing & AI Logic
├── frontend/           # React HUD Workspace (White & Blue Theme)
├── Dockerfile          # Multi-stage production build (Node + Python)
├── .dockerignore       # Build optimization & security
└── README.md           # Project Documentation
```

## 🛡️ Security Features
- **Hardened Headers**: Strict CSP, XSS protection, and Frame-Options (Flask-Talisman style).
- **Rate Limiting**: Integrated `Flask-Limiter` (10 requests/min) to prevent API abuse.
- **Safe Uploads**: Strict file extension filtering and 10MB size limits.
- **Non-Root Execution**: Container runs as a restricted `appuser`.
- **Error Sanitization**: Production-safe error handling with zero debug leakage.

---

## 🚀 How to Use

### 🐳 Running with Docker
```bash
# Build the image
docker build -t pastecv .

# Run the container (Requires GROQ_API_KEY)
docker run -p 5000:5000 -e GROQ_API_KEY=your_key_here pastecv
```

### 💻 Local Development
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

<div align="center">
  <img src="https://avatars.githubusercontent.com/KhairatMouhcine?v=4" width="100px" style="border-radius:50%" />
  <h3>KhairatMouhcine</h3>
  <p>
    <a href="https://github.com/KhairatMouhcine">
      <img src="https://img.shields.io/badge/GitHub-KhairatMouhcine-181717?style=flat-square&logo=github" />
    </a>
    &nbsp;
    <a href="mailto:khairatmouhcine125@gmail.com">
      <img src="https://img.shields.io/badge/Email-khairatmouhcine125%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" />
    </a>
  </p>
</div>
