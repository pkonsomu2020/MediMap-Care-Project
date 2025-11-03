from sentence_transformers import SentenceTransformer
from difflib import SequenceMatcher
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv
import os, requests, re
import numpy as np
from math import radians, sin, cos, sqrt, atan2
import json

# --- 1. SETUP ---
app = FastAPI(title="Clinic Embedding Microservice")

# ✅ Load environment file (auto-detects absolute path)
# This will search upward from the current file's directory for ".test_env"
env_path = find_dotenv(".env", raise_error_if_not_found=False)
if env_path:
    load_dotenv(env_path)
    print(f"✅ Loaded environment from: {env_path}")
else:
    print("⚠️ .env not found — falling back to default .env")
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
    place_id: int = Field(..., description="Clinic place_id")
    name: str
    address: str
    services: str
    longitude: float = Field(..., description="Clinic longitude")
    latitude: float = Field(..., description="Clinic latitude")
    details: Optional[Any] = Field(None, description="Additional details about the clinic")
    source: Optional[str] = Field(None, description="Data source")
    google_place_id: Optional[str] = Field(None, description="Google Place ID")

class UpdateEmbeddingRequest(BaseModel):
    """Model for the /update endpoint, only requires the clinic ID."""
    place_id: int = Field(..., description="The place_id of the clinic to update.")

class EmbedRequest(BaseModel):
    clinics: List[ClinicData]

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class UpdateClinicRequest(BaseModel):
    """Model for the /update endpoint to handle clinic data conflicts."""
    name: str
    address: str
    services: str
    longitude: float
    latitude: float
    source: Optional[str] = Field(None, description="Data source information")


# --- HELPERS ---
def combine_clinic_data(clinic: ClinicData) -> str:
    # Convert details to string if it's a dict
    details_str = ""
    if clinic.details:
        if isinstance(clinic.details, dict):
            details_str = json.dumps(clinic.details)
        else:
            details_str = str(clinic.details)
    
    return (
        f"Clinic Name: {clinic.name}. "
        f"Address: {clinic.address}. "
        f"Services Offered: {clinic.services}. "
        f"Location Coordinates: {clinic.latitude}, {clinic.longitude}. "
        f"Clinic place_id: {clinic.place_id}."
        f"Details: {details_str}"
    )

def get_highest_place_id() -> Optional[int]:
    """
    Return the highest place_id present in the SUPABASE_TABLE.
    Returns None if table is empty or on error.
    """
    try:
        print("🔍 Querying Supabase for highest place_id...")
        result = (
            supabase.table(SUPABASE_TABLE)
            .select("place_id")
            .order("place_id", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            print("⚠️ No clinics found in table.")
            return 0

        place_id = result.data[0].get("place_id")
        if place_id is None:
            print("⚠️ Retrieved row missing 'place_id'.")
            return None

        try:
            return int(place_id)
        except (TypeError, ValueError):
            # If casting fails, return None and log
            print(f"⚠️ Unable to cast place_id to int: {place_id}")
            return None

    except Exception as e:
        print(f"❌ Error fetching highest place_id: {e}")
        return None
    
def get_lowest_place_id() -> Optional[int]:
    """
    Return the highest place_id present in the SUPABASE_TABLE.
    Returns None if table is empty or on error.
    """
    try:
        print("🔍 Querying Supabase for highest place_id...")
        result = (
            supabase.table(SUPABASE_TABLE)
            .select("place_id")
            .order("place_id", desc=False)
            .limit(1)
            .execute()
        )

        if not result.data:
            print("⚠️ No clinics found in table.")
            return 0

        place_id = result.data[0].get("place_id")
        if place_id is None:
            print("⚠️ Retrieved row missing 'place_id'.")
            return None

        try:
            return int(place_id)
        except (TypeError, ValueError):
            # If casting fails, return None and log
            print(f"⚠️ Unable to cast place_id to int: {place_id}")
            return None

    except Exception as e:
        print(f"❌ Error fetching highest place_id: {e}")
        return None

def get_clinic_data_by_id(place_id: int) -> ClinicData | None:
    """Fetches a single clinic's essential data from Supabase using its place_id."""
    try:
        print(f"🔍 Fetching clinic place_id: {place_id} from table {SUPABASE_TABLE}")

        result = (
            supabase.table(SUPABASE_TABLE)
            .select("place_id, name, address, services, longitude, latitude, details, source, google_place_id")
            .eq("place_id", place_id)
            .limit(1)
            .execute()
        )

        if not result.data:
            print(f"⚠️ No clinic found for place_id {place_id}")
            return None

        clinic_data = result.data[0]
        print(f"✅ Clinic found: {clinic_data}")
        return ClinicData(**clinic_data)

    except Exception as e:
        print(f"❌ Error fetching clinic data for place_id {place_id}: {e}")
        return None
    
def normalize_name(name: str) -> str:
    """
    Normalize a clinic name by:
    - Lowercasing
    - Removing punctuation, special chars, and multiple spaces
    - Replacing common abbreviations (e.g. 'st.' -> 'saint')
    """
    if not name:
        return ""
    
    name = name.lower().strip()
    
    # Expand common medical/clinic-related abbreviations
    replacements = {
        r"\bst[.]?\b": "saint",
        r"\bhosp\b": "hospital",
        r"\bctr\b": "center",
        r"\bmed\b": "medical",
        r"\bclin\b": "clinic"
    }
    for pattern, repl in replacements.items():
        name = re.sub(pattern, repl, name)
    
    # Remove non-alphanumeric characters and compress spaces
    name = re.sub(r"[^a-z0-9\s]", " ", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()


def check_name(name1: str, name2: str, threshold: float = 0.8) -> bool:
    """
    Returns True if two clinic names are similar enough.
    
    Args:
        name1: The first clinic name
        name2: The second clinic name
        threshold: The minimum ratio (0–1) for considering them a match
    """
    if not name1 or not name2:
        return False

    n1 = normalize_name(name1)
    n2 = normalize_name(name2)

    if not n1 or not n2:
        return False

    ratio = SequenceMatcher(None, n1, n2).ratio()
    print(f"🔠 Name similarity between '{name1}' and '{name2}': {ratio:.2f}")

    return ratio >= threshold

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points 
    on the Earth (specified in decimal degrees)
    """
    from math import radians, sin, cos, sqrt, atan2
    
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    radius_earth_km = 6371  # Radius of earth in kilometers
    distance = radius_earth_km * c
    
    return distance

def find_similar_clinics_by_vector_search(clinic_name: str, top_k: int = 5):
    """
    Find similar clinics using vector search based on name similarity.
    Returns top_k most similar clinics.
    """
    try:
        # Generate embedding for the clinic name
        name_embedding = model.encode([clinic_name])[0].tolist()
        
        # Search for similar clinics using Supabase RPC
        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/match_clinics"
        payload = {
            "query_embedding": name_embedding, 
            "match_count": top_k
        }
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(rpc_url, headers=headers, json=payload)

        if response.status_code != 200:
            print(f"❌ Supabase RPC error: {response.text}")
            return []

        results = response.json()
        print(f"🔍 Vector search found {len(results)} similar clinics")
        
        # Debug: print the structure of results
        if results:
            print(f"📋 First result keys: {list(results[0].keys())}")
        
        return results

    except Exception as e:
        print(f"❌ Error finding similar clinics by vector search: {e}")
        return []

def get_clinic_details_by_id_from_supabase(place_id: int):
    """
    Get clinic details directly from Supabase using the ID from vector search.
    The vector search might return 'id' instead of 'place_id'.
    """
    try:
        # Try with place_id first
        result = (
            supabase.table(SUPABASE_TABLE)
            .select("place_id, name, latitude, longitude, source, details")
            .eq("place_id", place_id)
            .limit(1)
            .execute()
        )
        
        if result.data:
            return result.data[0]
        
        # If not found with place_id, try with id
        result = (
            supabase.table(SUPABASE_TABLE)
            .select("place_id, name, latitude, longitude, source, details")
            .eq("id", place_id)
            .limit(1)
            .execute()
        )
        
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"❌ Error getting clinic details for ID {place_id}: {e}")
        return None


def find_clinic_by_vector_and_location(target_name: str, target_lat: float, target_lon: float, top_k: int = 5):
    """
    Find clinics using vector search first, then check geographic distance.
    Only considers top_k vector results for distance checking.
    Returns the closest clinic within 3km, or None if none found.
    """
    try:
        print(f"🔍 Starting hybrid search for '{target_name}'")
        print(f"📍 Target location: ({target_lat}, {target_lon})")
        
        # Step 1: Vector search for similar names
        similar_clinics = find_similar_clinics_by_vector_search(target_name, top_k)
        
        if not similar_clinics:
            print("❌ No similar clinics found in vector search")
            return None
        
        print(f"📍 Checking top {min(len(similar_clinics), top_k)} vector results for geographic proximity...")
        
        # Step 2: Check geographic distance for top vector results
        closest_clinic = None
        min_distance = float('inf')
        
        for i, clinic in enumerate(similar_clinics[:top_k]):
            # The vector search might return 'id' instead of 'place_id'
            clinic_id = clinic.get('id') or clinic.get('place_id')
            clinic_name = clinic.get('name', 'Unknown')
            similarity_score = clinic.get('similarity', 0)
            
            if not clinic_id:
                print(f"   ⚠️ Clinic '{clinic_name}' missing ID, skipping")
                continue
            
            # Get full clinic details including coordinates
            clinic_details = get_clinic_details_by_id_from_supabase(clinic_id)
            
            if not clinic_details:
                print(f"   ⚠️ Could not fetch details for clinic ID {clinic_id}, skipping")
                continue
                
            clinic_lat = clinic_details.get('latitude')
            clinic_lon = clinic_details.get('longitude')
            
            if clinic_lat is None or clinic_lon is None:
                print(f"   ⚠️ Clinic '{clinic_name}' missing coordinates, skipping")
                continue
                
            distance = haversine_distance(target_lat, target_lon, clinic_lat, clinic_lon)
            
            print(f"   {i+1}. 📍 '{clinic_name}' - {distance:.2f}km away (similarity: {similarity_score:.3f})")
            
            if distance <= 3.0 and distance < min_distance:  # 3km radius
                min_distance = distance
                closest_clinic = clinic_details
                closest_clinic['distance_km'] = distance
        
        if closest_clinic and check_name(target_name, closest_clinic.get('name')):
            print(f"✅ Found matching clinic '{closest_clinic.get('name')}' - {min_distance:.2f}km away")
            return closest_clinic
        else:
            print(f"❌ No clinics within 3km radius among top {len(similar_clinics[:top_k])} vector results")
            return None
            
    except Exception as e:
        print(f"❌ Error in hybrid clinic search: {e}")
        return None


# --- ENDPOINTS ---
lowest_id, hightst_id = get_lowest_place_id(), get_highest_place_id()
print(f"✅ Lowest place_id in database: {lowest_id}, ✅ Highest place_id in database: {hightst_id}")
lowest_id -= 1
hightst_id += 1
use_id = lowest_id if lowest_id is not None and lowest_id > 0 else hightst_id
print(f"🔢 Starting place_id for new entries: {use_id} {'downwards' if use_id == lowest_id else 'upwards'}")

@app.post("/embed")
async def embed_clinics(req: EmbedRequest):
    clinic_texts = [combine_clinic_data(clinic) for clinic in req.clinics]
    embeddings = model.encode(clinic_texts, show_progress_bar=False).tolist()

    response = [
        {"place_id": clinic.place_id, "embedding": embeddings[i]}
        for i, clinic in enumerate(req.clinics)
    ]

    return {"count": len(response), "results": response}


@app.post("/update_embeddings")
async def update_embedding(req: UpdateEmbeddingRequest):
    """
    Reworked endpoint: Fetches clinic data by place_id, recalculates embedding, 
    and updates the database.
    """
    try:
        # 1. FETCH existing clinic data from the database
        clinic = get_clinic_data_by_id(req.place_id)

        if clinic is None:
            raise HTTPException(status_code=404, detail=f"Clinic with place_id {req.place_id} not found.")

        # 2. GENERATE new embedding from the fetched data
        text = combine_clinic_data(clinic)
        embedding = model.encode([text])[0].tolist()

        # 3. UPDATE the database with the new embedding
        result = (
            supabase.table(SUPABASE_TABLE)
            .update({"embedding": embedding})
            .eq("place_id", req.place_id)
            .execute()
        )

        if not result.data:
            # A successful query with .eq() but no update means the row might not exist
            # or the update failed for other reasons.
            raise HTTPException(status_code=404, detail="Clinic not found or database update failed.")

        return {"place_id": req.place_id, "status": "updated", "embedding_length": len(embedding)}

    except HTTPException as http_e:
        # Re-raise explicit HTTP exceptions (like 404)
        raise http_e
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


@app.post("/update")
async def update_clinic_with_conflict_resolution(req: UpdateClinicRequest):
    """
    Update clinic data with conflict resolution between Google Maps and existing data.
    Uses hybrid search (vector + geographic) for conflict detection.
    """
    global use_id, lowest_id, hightst_id

    try:
        print("---\n", req, "\n ---")
        
        # Use hybrid search: vector search first, then geographic filtering
        similar_clinic = find_clinic_by_vector_and_location(
            req.name,
            req.latitude, 
            req.longitude,
            top_k=5  # Only check top 5 vector results
        )
        
        if similar_clinic:
            # Conflict exists - update existing entry
            place_id = similar_clinic['place_id']
            print(f"🔄 Conflict detected, updating existing clinic place_id: {place_id}")
            print(f"   Target location: ({req.latitude}, {req.longitude})")
            print(f"   Existing location: ({similar_clinic.get('latitude')}, {similar_clinic.get('longitude')})")
            
            # Fetch current clinic data
            current_clinic = get_clinic_data_by_id(place_id)
            if not current_clinic:
                raise HTTPException(status_code=404, detail="Existing clinic not found")
            
            # Prepare update data with conflict resolution
            update_data = {}
            
            # Favor existing services, add Google services to details
            current_details = current_clinic.details
            
            # Handle details - it could be a dict, string, or None
            if current_details:
                if isinstance(current_details, dict):
                    details_obj = current_details.copy()
                elif isinstance(current_details, str):
                    try:
                        details_obj = json.loads(current_details)
                        if not isinstance(details_obj, dict):
                            details_obj = {"existing_details": current_details}
                    except:
                        details_obj = {"existing_details": current_details}
                else:
                    details_obj = {"existing_details": str(current_details)}
            else:
                details_obj = {}
            
            # Add Google services to details
            details_obj["google_services"] = req.services
            update_data["details"] = details_obj  # Store as JSON object
            
            # Favor Google coordinates
            update_data["longitude"] = req.longitude
            update_data["latitude"] = req.latitude
            
            # Update source field to include Google Maps API
            current_source = similar_clinic.get('source', '')
            if current_source:
                if "Google Maps API" not in current_source:
                    update_data["source"] = f"{current_source}, Google Maps API"
            else:
                update_data["source"] = "Google Maps API"
            
            # Update address if different (favor more complete address)
            if req.address.strip().lower() != current_clinic.address.strip().lower():
                # Keep the longer address (likely more complete)
                if len(req.address) > len(current_clinic.address):
                    update_data["address"] = req.address
            
            print("\n\nCompleted prepared update data:", update_data)
            
            # Perform the update
            result = (
                supabase.table(SUPABASE_TABLE)
                .update(update_data)
                .eq("place_id", place_id)
                .execute()
            )
            
            if not result.data:
                raise HTTPException(status_code=404, detail="Clinic not found or update failed")
            
            return {
                "status": "updated_existing",
                "place_id": place_id,
                "changes": update_data
            }
            
        else:
            # No conflict found - create new entry
            print("✅ No conflict detected, creating new clinic entry")
            
            # Prepare new clinic data
            new_clinic_data = {
                "name": req.name,
                "address": req.address,
                "services": req.services,
                "longitude": req.longitude,
                "latitude": req.latitude,
                "details": {"source_services": req.services} if req.services else None,
                "source": "Google Maps API"
            }
            
            # Create ClinicData object for embedding
            clinic_data = ClinicData(
                place_id=use_id,
                name=req.name,
                address=req.address,
                services=req.services,
                longitude=req.longitude,
                latitude=req.latitude,
                details={"source_services": req.services} if req.services else None
            )
            
            text = combine_clinic_data(clinic_data)
            embedding = model.encode([text])[0].tolist()
            new_clinic_data["embedding"] = embedding
            new_clinic_data["place_id"] = use_id
            
            # Insert new clinic
            result = (
                supabase.table(SUPABASE_TABLE)
                .insert(new_clinic_data)
                .execute()
            )
            
            if not result.data:
                raise HTTPException(status_code=500, detail="Failed to create new clinic")
            
            # Update the Id for next use
            if use_id == lowest_id:
                lowest_id -= 1
            else:
                hightst_id += 1
            use_id = lowest_id if lowest_id is not None and lowest_id > 0 else hightst_id

            return {
                "status": "created_new",
                "place_id": result.data[0]['place_id'],
                "message": "New clinic created successfully"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/search")
async def search_clinics(req: SearchRequest):
    try:
        query_embedding = model.encode(req.query).tolist()

        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/match_clinics"
        payload = {"query_embedding": query_embedding, "match_count": req.top_k if req.top_k else 3}
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(rpc_url, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Supabase error: {response.text}. Payload: {req.model_dump_json()}"
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