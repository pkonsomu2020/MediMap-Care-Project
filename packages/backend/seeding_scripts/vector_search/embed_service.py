from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import dotenv

app = FastAPI()
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

class EmbedRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: EmbedRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}

if __name__ == "__main__":
    port = dotenv.get_key("backend\.env", "MICROSERVICE_PORT")
    print(port)
    uvicorn.run(app, host="0.0.0.0", port=port if port else 8000)
