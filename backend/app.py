import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

import io
import PyPDF2
import docx

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
    else:
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
def parse_cv():
    data = request.json
    cv_text = data.get('text')
    if not cv_text:
        return jsonify({"error": "No CV text provided"}), 400
    try:
        structured_data = get_cv_data(cv_text)
        return jsonify(structured_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
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
            
            text = extract_text_from_file(file)
            if text:
                structured_data = get_cv_data(text)
                if 'cvs' in structured_data:
                    all_cvs.extend(structured_data['cvs'])
                else:
                    all_cvs.append(structured_data)
        
        return jsonify({"cvs": all_cvs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
