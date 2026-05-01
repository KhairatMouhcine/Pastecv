import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from groq import Groq
from dotenv import load_dotenv
import PyPDF2
import docx

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', static_url_path='/')

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
CORS(app, origins=ALLOWED_ORIGINS, methods=["GET", "POST"], allow_headers=["Content-Type"])

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}


@app.after_request
def set_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def extract_text_from_file(file):
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    elif filename.endswith('.docx'):
        doc = docx.Document(file)
        return "\n".join([para.text for para in doc.paragraphs])
    elif filename.endswith('.txt'):
        return file.read().decode('utf-8')
    return None


def get_cv_data(cv_text):
    system_prompt = (
        "You are an expert recruiter assistant. "
        "Your task is to identify and extract ALL individual CVs from the provided text. "
        "Return a JSON object with a key 'cvs' which is an array of objects. "
        "Each object must contain: name, email, skills (array), experience (array of objects), "
        "and education (array of objects). "
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Text containing one or more CVs:\n{cv_text}"}
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
    )
    return json.loads(chat_completion.choices[0].message.content)


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route('/parse', methods=['POST'])
@limiter.limit("10 per minute")
def parse_cv():
    data = request.json
    cv_text = data.get('text')
    if not cv_text:
        return jsonify({"error": "No CV text provided"}), 400
    try:
        structured_data = get_cv_data(cv_text)
        return jsonify(structured_data)
    except Exception as e:
        logger.error("Error in /parse: %s", e)
        return jsonify({"error": "Failed to process CV"}), 500


@app.route('/upload', methods=['POST'])
@limiter.limit("10 per minute")
def upload_files():
    if 'file' not in request.files:
        if 'files' in request.files:
            files = request.files.getlist('files')
        else:
            return jsonify({"error": "No file part"}), 400
    else:
        files = [request.files['file']]

    all_cvs = []
    try:
        for file in files:
            if file.filename == '':
                continue

            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                return jsonify({"error": f"File type '{ext}' is not allowed"}), 400

            file.seek(0, 2)
            file_size = file.tell()
            file.seek(0)
            if file_size > MAX_FILE_SIZE:
                return jsonify({"error": f"File '{file.filename}' exceeds the 10 MB size limit"}), 413

            text = extract_text_from_file(file)
            if text:
                structured_data = get_cv_data(text)
                if 'cvs' in structured_data:
                    all_cvs.extend(structured_data['cvs'])
                else:
                    all_cvs.append(structured_data)

        return jsonify({"cvs": all_cvs})
    except Exception as e:
        logger.error("Error in /upload: %s", e)
        return jsonify({"error": "Failed to process files"}), 500


if __name__ == '__main__':
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    app.run(debug=debug, host=host, port=5000)
