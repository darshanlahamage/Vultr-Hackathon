import json
from deepface import DeepFace

def verify_images(img1_path, img2_path):
    """
    Verifies whether two images (aadhaar and uploaded photo) match using DeepFace.

    :param img1: First image (Aadhaar)
    :param img2: Second image (Uploaded for KYC)
    :return: JSON response containing verification status and distance
    """
    try:
        # Perform KYC verification using DeepFace
        result = DeepFace.verify(img1_path=img1_path, img2_path=img2_path)
        json_result = json.dumps(result, indent=2)

        # Return the result as a dictionary
        return json_result

    except Exception as e:
        raise ValueError(f"Error during KYC verification: {str(e)}")