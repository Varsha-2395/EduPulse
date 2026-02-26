import os
import tempfile

import whisper
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

print("Loading Whisper model...")
model = whisper.load_model("medium")
print("Whisper model loaded")


@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    temp_path = None

    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file"}), 400

        audio_file = request.files["audio"]
        language = request.form.get("language", "en")

        filename = audio_file.filename or "recording.webm"
        _, ext = os.path.splitext(filename)
        suffix = ext if ext else ".webm"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        result = model.transcribe(temp_path, language=language)
        return jsonify({"text": result.get("text", "")})

    except Exception as e:
        print("WHISPER CRASH:", str(e))
        return jsonify({"error": str(e)}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(port=8000, debug=True)
