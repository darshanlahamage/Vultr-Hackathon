from flask import Flask, request, jsonify
from kyc import verify_images
import os

app = Flask(__name__)

# Temporary directory for saving uploaded images
TEMP_FOLDER = './temp_images'
os.makedirs(TEMP_FOLDER, exist_ok=True)

@app.route('/verify-kyc', methods=['POST'])
def verify_kyc_route():
    try:
        # Get the files from the request
        img1 = request.files.get('img1')
        img2 = request.files.get('img2')

        if not img1 or not img2:
            return jsonify({"error": "Both images are required"}), 400

        # Save images temporarily
        img1_path = os.path.join(TEMP_FOLDER, 'img1.jpg')
        img2_path = os.path.join(TEMP_FOLDER, 'img2.jpg')

        img1.save(img1_path)
        img2.save(img2_path)

        # Call the KYC verification function
        result = verify_images(img1_path, img2_path)

        # Clean up: Remove temporary files
        os.remove(img1_path)
        os.remove(img2_path)

        return result, 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "Running KYC Verification Model"

if __name__ == '__main__':
    app.run(debug=True)