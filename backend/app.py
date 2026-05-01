import os
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
        system_prompt = (
            "You are an expert recruiter assistant. "
            "Extract the following information from the provided CV text into a JSON object: "
            "name, email, skills (as an array), experience (as an array of objects with title, company, and duration), "
            "and education (as an array of objects with degree and school). "
            "Return ONLY the JSON object."
        )

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"CV Text:\n{cv_text}"}
            ],
            model="llama3-8b-8192",
            response_format={"type": "json_object"},
        )

        # Parse the string response into a Python dictionary
        import json
        structured_data = json.loads(chat_completion.choices[0].message.content)
        
        return jsonify(structured_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
