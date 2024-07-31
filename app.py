from flask import Flask, request, jsonify, render_template
import os
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['LOCATION_FILE'] = 'location.txt'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

def save_location(latitude, longitude):
    try:
        with open(app.config['LOCATION_FILE'], 'a') as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}, {latitude}, {longitude}\n")
        print(f"Location saved: {latitude}, {longitude}")
    except Exception as e:
        print(f"Error saving location: {e}")

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file part'})

    image = request.files['image']
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')

    if latitude and longitude:
        save_location(latitude, longitude)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    image_filename = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp}_image.jpg")

    image.save(image_filename)

    data = {
        'latitude': latitude,
        'longitude': longitude,
        'image_path': image_filename,
    }

    return jsonify({'message': 'Image uploaded successfully', 'data': data})

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file part'})

    audio = request.files['audio']
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')

    if latitude and longitude:
        save_location(latitude, longitude)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    audio_filename = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp}_audio.mp3")

    audio.save(audio_filename)

    data = {
        'latitude': latitude,
        'longitude': longitude,
        'audio_path': audio_filename,
    }

    return jsonify({'message': 'Audio uploaded successfully', 'data': data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
