from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import tempfile
import os
import shutil

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/verify-gender")
async def verify_gender(image: UploadFile = File(...)):
    """
    Accepts an image, detects the face, and verifies if the dominant gender is 'Woman'.
    """
    # Create a temporary file path
    suffix = os.path.splitext(image.filename)[1]
    if not suffix:
        suffix = ".jpg"
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        try:
            # Save the uploaded file to the temporary path
            shutil.copyfileobj(image.file, temp_file)
            temp_file.close() # Close to allow DeepFace to read it on some OS

            # Analyze the image using DeepFace
            # enforce_detection=False makes it more robust if detection is tricky
            results = DeepFace.analyze(img_path=temp_path, actions=['gender'], enforce_detection=False)
            
            # DeepFace returns a list of detections (for multiple faces)
            # We assume the first detected face for this verification
            dominant_gender = results[0]['dominant_gender']
            
            if dominant_gender == 'Woman':
                return {"verified": True, "gender": "Woman"}
            else:
                return {"verified": False, "gender": dominant_gender}
                
        except Exception as e:
            # Generic error handling for other issues (e.g., image processing errors)
            print(f"Vision error: {str(e)}")
            raise HTTPException(status_code=500, detail={"error": str(e)})
        finally:
            # Cleanup: ensure the temp file is deleted
            if os.path.exists(temp_path):
                os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
