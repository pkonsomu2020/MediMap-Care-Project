from sentence_transformers import SentenceTransformer
<<<<<<< HEAD
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv
import os, requests

# --- 1. SETUP ---
app = FastAPI(title="Clinic Embedding Microservice")

# ✅ Load environment file (auto-detects absolute path)
# This will search upward from the current file’s directory for ".test_env"
env_path = find_dotenv(".test_env", raise_error_if_not_found=False)
if env_path:
    load_dotenv(env_path)
    print(f"✅ Loaded environment from: {env_path}")
else:
    print("⚠️ .test_env not found — falling back to default .env")
    load_dotenv(find_dotenv(".env", raise_error_if_not_found=False))

# --- PORT ---
PORT = int(os.getenv("MICROSERVICE_PORT"))

# --- SUPABASE SETUP ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")  # Or SERVICE_KEY if testing privileged routes
SUPABASE_TABLE = os.getenv("SUPABASE_CLINICS", "clinics")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- LOAD MODEL ---
print("Loading SentenceTransformer model...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("✅ Model loaded successfully.")


# --- MODELS ---
class ClinicData(BaseModel):
    id: int
    name: str
    address: str
    services: str
    longitude: float = Field(..., description="Clinic longitude")
    latitude: float = Field(..., description="Clinic latitude")
    details: Optional[str] = Field(None, description="Additional details about the clinic")

class UpdateEmbeddingRequest(BaseModel):
    """Model for the /update endpoint, only requires the clinic ID."""
    id: int = Field(..., description="The ID of the clinic to update.")

class EmbedRequest(BaseModel):
    clinics: List[ClinicData]


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


# --- HELPERS ---
def combine_clinic_data(clinic: ClinicData) -> str:
    return (
        f"Clinic Name: {clinic.name}. "
        f"Address: {clinic.address}. "
        f"Services Offered: {clinic.services}. "
        f"Location Coordinates: {clinic.latitude}, {clinic.longitude}. "
        f"Clinic ID: {clinic.id}."
        f"Details: {clinic.details or ''}"
    )

def get_clinic_data_by_id(clinic_id: int) -> ClinicData | None:
    """Fetches a single clinic's essential data from Supabase using its ID."""
    try:
        print(f"🔍 Fetching clinic ID: {clinic_id} from table {SUPABASE_TABLE}")

        result = (
            supabase.table(SUPABASE_TABLE)
            .select("id, name, address, services, longitude, latitude, details")
            .eq("id", clinic_id)
            .limit(1)
            .execute()
        )

        # Inspect raw response
        print(f"🧾 Raw Supabase response: {result}")

        if not result.data:
            print(f"⚠️ No clinic found for ID {clinic_id}")
            return None

        clinic_data = result.data[0]
        print(f"✅ Clinic found: {clinic_data}")
        return ClinicData(**clinic_data)

    except Exception as e:
        print(f"❌ Error fetching clinic data for ID {clinic_id}: {e}")
        return None



# --- ENDPOINTS ---

@app.post("/embed")
async def embed_clinics(req: EmbedRequest):
    clinic_texts = [combine_clinic_data(clinic) for clinic in req.clinics]
    embeddings = model.encode(clinic_texts, show_progress_bar=False).tolist()

    response = [
        {"id": clinic.id, "embedding": embeddings[i]}
        for i, clinic in enumerate(req.clinics)
    ]

    return {"count": len(response), "results": response}


@app.post("/update_embeddings")
async def update_embedding(req: UpdateEmbeddingRequest):
    """
    Reworked endpoint: Fetches clinic data by ID, recalculates embedding, 
    and updates the database.
    """
    try:
        # 1. FETCH existing clinic data from the database
        clinic = get_clinic_data_by_id(req.id)

        if clinic is None:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {req.id} not found.")

        # 2. GENERATE new embedding from the fetched data
        text = combine_clinic_data(clinic)
        embedding = model.encode([text])[0].tolist()

        # 3. UPDATE the database with the new embedding
        result = (
            supabase.table(SUPABASE_TABLE)
            .update({"embedding": embedding})
            .eq("id", req.id)
            .execute()
        )

        if not result.data:
            # A successful query with .eq() but no update means the row might not exist
            # or the update failed for other reasons.
            raise HTTPException(status_code=404, detail="Clinic not found or database update failed.")

        return {"id": req.id, "status": "updated", "embedding_length": len(embedding)}

    except HTTPException as http_e:
        # Re-raise explicit HTTP exceptions (like 404)
        raise http_e
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


@app.post("/search")
async def search_clinics(req: SearchRequest):
    try:
        query_embedding = model.encode(req.query).tolist()

        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/match_clinics"
        payload = {"query_embedding": query_embedding, "match_count": req.top_k}
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(rpc_url, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Supabase error: {response.text}"
            )

        data = response.json()
        if not data:
            return {"count": 0, "results": []}

        return {"count": len(data), "results": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 4. RUNNER ---
if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on port {PORT}...")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
=======
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
>>>>>>> 4d8d84b1b246913aa07a0c37033434603325ead3
