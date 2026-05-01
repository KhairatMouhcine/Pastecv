# 📄 PasteCV — AI-Powered Resume Parser



---

### 🚀 The Problem
Recruiters receive CVs in inconsistent formats (PDF, DOCX, TXT, or just raw text) and waste hours extracting key information manually. 

### 💡 Why It Matters
A recruiter reviewing **50 CVs/day** loses **2–3 hours** just to formatting noise and manual data entry. PasteCV eliminates this friction.

### ✨ Core Feature
Simply **paste raw CV text** or upload a file, and get a **structured JSON output** containing:
- 👤 Name & Contact Info
- 🛠️ Skills
- 💼 Professional Experience
- 🎓 Education

---

## 🛠️ Tech Stack
- **Backend**: Python / Flask
- **AI**: Groq API (LPU™ Acceleration)
- **Containerization**: Docker (Multi-stage builds)
- **Frontend**: React / Vite / Vanilla CSS

## 📦 Project Structure
```text
.
├── backend/            # Flask API & AI Logic
├── frontend/           # React HUD Interface
├── Dockerfile          # Multi-stage production build
├── .dockerignore       # Build optimization
└── README.md           # Project Documentation
```

## 🛡️ Security Features
- **Hardened Headers**: Strict CSP, XSS protection, and Frame-Options.
- **Rate Limiting**: Protection against API abuse (10 requests/min).
- **Safe Uploads**: Strict file extension filtering and 10MB size limits.
- **Non-Root Execution**: Container runs as a restricted `appuser`.
- **Error Sanitization**: Zero debug info exposed in production.

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
