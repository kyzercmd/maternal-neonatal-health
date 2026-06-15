from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
import os

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # In a real production environment, you should use a secrets manager or .env file.
    # For now, we'll assume it's set in the environment.
    pass

client = genai.Client(api_key=GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert digital midwife helping mothers in Bangladesh. You must ALWAYS respond strictly in Bangla. Keep your medical advice supportive, clear, localized, and easy to understand for a mother."
            )
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Failed to get response from Gemini")
            
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
