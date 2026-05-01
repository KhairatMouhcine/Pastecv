# PasteCV — AI Batch Resume Parser

> Day 1 of my 30-day Docker challenge.

## The Problem

Recruiters receive CVs in PDF, DOCX, and plain-text formats and spend 2–3 hours a day manually extracting names, skills, and experience from inconsistent layouts.

## The Solution

PasteCV lets you paste raw resume text or upload a batch of files (PDF / DOCX / TXT). It sends the content to a Llama-3.3-70B model via the Groq API and returns clean, structured JSON — name, email, skills, experience, education — for every candidate in seconds.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Bootstrap |
| Backend | Python 3.12 + Flask |
| AI | Groq API (Llama-3.3-70B) |
| Infra | Docker multi-stage build |

---

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- A free Groq API key → [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/pastecv.git
cd pastecv
```

### 2. Build the image

```bash
docker build -t pastecv .
```

### 3. Run the container

```bash
docker run -p 5000:5000 -e GROQ_API_KEY=your_key_here pastecv
```

### 4. Open the app

Navigate to [http://localhost:5000](http://localhost:5000)

---

## Local Development (without Docker)

### Backend

```bash
cd backend
cp ../.env.example .env        # then fill in your GROQ_API_KEY
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
cp .env.example .env.local     # set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server proxies API calls to Flask on port 5000.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Groq Cloud API key |
| `FLASK_DEBUG` | No | `0` | Set to `1` to enable debug mode |
| `FLASK_HOST` | No | `127.0.0.1` | Host Flask binds to |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |

Copy `.env.example` to `backend/.env` and fill in your values. **Never commit `.env` — it is gitignored.**

---

## API Endpoints

### `GET /health`
Returns service status.
```json
{ "status": "healthy" }
```

### `POST /parse`
Parse raw CV text.

**Request**
```json
{ "text": "John Doe\njohn@example.com\nSkills: Python, Docker..." }
```

**Response**
```json
{
  "cvs": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["Python", "Docker"],
      "experience": [...],
      "education": [...]
    }
  ]
}
```

### `POST /upload`
Upload one or more resume files (multipart/form-data).

- Field name: `files`
- Accepted types: `.pdf`, `.docx`, `.txt`
- Max file size: **10 MB per file**
- Rate limit: **10 requests/minute**

---

## Troubleshooting

### `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`

**Cause:** `groq==0.9.0` passes a `proxies` argument to `httpx` internally. `httpx>=0.28.0` removed that parameter, causing a crash at startup.

**Fix:** `httpx<0.28.0` is already pinned in `requirements.txt`. If you hit this error, make sure you rebuild the Docker image after pulling the latest code:

```bash
docker build --no-cache -t pastecv .
```

---

### Container exits immediately with no output

Make sure you pass the API key:

```bash
docker run -p 5000:5000 -e GROQ_API_KEY=your_key_here pastecv
```

---

### CORS error in the browser

Set `CORS_ORIGINS` to your frontend URL:

```bash
docker run -p 5000:5000 \
  -e GROQ_API_KEY=your_key_here \
  -e CORS_ORIGINS=http://localhost:5173 \
  pastecv
```

---

### File upload returns 400 — file type not allowed

Only `.pdf`, `.docx`, and `.txt` are accepted. The check is done server-side regardless of what the browser sends.

---

### Rate limit hit (HTTP 429)

The API is limited to 10 requests per minute per IP. Wait a moment and retry.

---

## Project Structure

```
.
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt    # Pinned Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   └── index.css       # Styles
│   ├── .env.example        # Frontend env template
│   └── package.json
├── Dockerfile              # Multi-stage build
└── .dockerignore
```

---

## Security

- API key injected at runtime via environment variable — never baked into the image
- Container runs as non-root user (`appuser`, uid 1000)
- CORS restricted to configured origins
- Security headers on every response (X-Frame-Options, X-Content-Type-Options, etc.)
- File uploads validated server-side (extension + 10 MB size limit)
- Internal errors logged server-side only — no stack traces returned to clients
- Rate limiting on all AI endpoints (10 req/min)

---

## License

MIT
