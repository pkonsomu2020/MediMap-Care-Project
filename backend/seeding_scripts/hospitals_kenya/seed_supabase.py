import os
import random
from datetime import date, time, timedelta, datetime
from typing import List, Dict, Optional
import bcrypt, json

from dotenv import load_dotenv, find_dotenv
from supabase import create_client, Client
import urllib.request, urllib.error
import requests
import re, traceback


# ✅ Load environment file (auto-detects absolute path)
# This will search upward from the current file's directory for ".test_env"
env_path = find_dotenv(".env", raise_error_if_not_found=False)
if env_path:
    load_dotenv(env_path)
    print(f"✅ Loaded environment from: {env_path}")
else:
    print("⚠️ .test_env not found — falling back to default .env")
    load_dotenv(find_dotenv(".env", raise_error_if_not_found=False))

def get_supabase_client() -> Client:

	url: str = os.environ.get("SUPABASE_URL")
	key: str = os.environ.get("SUPABASE_ANON_KEY")
	if not url or not key:
		raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment")
	return create_client(url, key)


clinics_table = os.environ.get("SUPABASE_CLINICS")
if not clinics_table:
	RuntimeError("SUPABASE_CLINICS not set in environment")

# ============================================================
# --- UNRESOLVED SEED TRACKING ---
# ============================================================

UNRESOLVED_SEED_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unresolved_seed.json")

def initialize_unresolved_file():
    """Initialize the unresolved seed file with empty structure"""
    if not os.path.exists(UNRESOLVED_SEED_FILE):
        with open(UNRESOLVED_SEED_FILE, 'w', encoding='utf-8') as f:
            json.dump({"clinics": []}, f, indent=2)
        print(f"✅ Created unresolved seed file: {UNRESOLVED_SEED_FILE}")
    else:
        print(f"✅ Unresolved seed file exists: {UNRESOLVED_SEED_FILE}")

def load_unresolved_seeds():
    """Load existing unresolved seeds from file"""
    if not os.path.exists(UNRESOLVED_SEED_FILE):
        print("⚠️ Unresolved seed file not found. It will be created on first error.")
        return {"clinics": []}
    
    try:
        with open(UNRESOLVED_SEED_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading unresolved seed file: {e}")
        return {"clinics": []}

def save_unresolved_clinic(clinic_data: Dict, error_message: str):
    """Save a clinic that failed to seed to the unresolved file"""
    # Ensure file exists
    if not os.path.exists(UNRESOLVED_SEED_FILE):
        initialize_unresolved_file()
    
    # Load current unresolved seeds
    unresolved_data = load_unresolved_seeds()
    
    # Add error information to clinic data
    clinic_with_error = clinic_data.copy()
    clinic_with_error["_seed_error"] = error_message
    clinic_with_error["_failed_at"] = datetime.now().isoformat()
    
    # Add to clinics array
    unresolved_data["clinics"].append(clinic_with_error)
    
    # Save back to file
    try:
        with open(UNRESOLVED_SEED_FILE, 'w', encoding='utf-8') as f:
            json.dump(unresolved_data, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved unresolved clinic to: {UNRESOLVED_SEED_FILE}")
    except Exception as e:
        print(f"❌ Error saving unresolved clinic: {e}")

def seed_users(supabase: Client, count: int = 10) -> List[int]:
	first_names = [
		"Alex", "Sam", "Jordan", "Taylor", "Chris", "Morgan", "Casey", "Riley", "Jamie", "Drew",
	]
	last_names = [
		"Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson",
	]
	users_payload: List[Dict] = []
	for i in range(count):
		name = f"{random.choice(first_names)} {random.choice(last_names)}"
		email = f"user{i+1}_{int(datetime.utcnow().timestamp())}@example.com"
		hashed_password = bcrypt.hashpw("Password123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
		users_payload.append(
			{
				"name": name,
				"email": email,
				"password": hashed_password,
				"phone": f"+1-555-01{str(i).zfill(2)}",
				"role": "user",
			}
		)

	resp = supabase.table("users").insert(users_payload).execute()
	# Supabase Python client returns dict-like with data list
	inserted = resp.data if hasattr(resp, "data") else resp["data"]
	return [row["user_id"] for row in inserted]


def seed_clinics(supabase: Client, count: int = 10, limit: bool = False) -> List[int]:
    DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_kmhfl_facilities_details.json")
    clinics_table = os.getenv("SUPABASE_CLINICS", "clinics")

    # ---------- DATA TRANSFORMATION ----------
    def transform(record) -> Optional[Dict]:
        """Transform clinic record with robust error handling"""
        try:
            name = record.get("name")
            contacts = record.get("contacts", [])
            coords = record.get("coordinates")
            
            # Safely handle coordinates
            if coords is None:
                latitude, longitude = None, None
            elif isinstance(coords, list) and len(coords) == 2:
                latitude, longitude = coords
            else:
                latitude, longitude = None, None

            details = {
                "admission_status": record.get("admission_status", ""),
                "keph_level": record.get("keph_level", ""),
                "ownership": record.get("owner", ""),
                "beds": record.get("beds", None),
                "facility_type": record.get("type", ""),
            }

            contact = {"phone": "", "email": ""}
            for value in contacts or []:
                if not value:
                    continue
                s = str(value).strip()
                if re.fullmatch(r"[^@]+@[^@]+\.[^@]+", s):
                    if contact["email"]:
                          contact["email"] += ", "
                    contact["email"] += s
                    continue
                
                digits = re.sub(r"\D", "", s)
                if digits and 6 <= len(digits) <= 15:
                    if contact["phone"]:
                         contact["phone"] += ", "
                    contact["phone"] += s
                    continue

            if record.get("google_location", {}):
                latitude = record["google_location"].get("lat", latitude)
                longitude = record["google_location"].get("lng", longitude)

            services = ", ".join([s["service"] for s in record.get("services", []) if s.get("service")])

            return {
                "place_id": record.get("code", ""),
                "name": name,
                "category": record.get("type", ""),
                "address": f"{record.get('ward', '')}, {record.get('sub_county', '')}, {record.get('county', '')}".strip(", "),
                "latitude": latitude,
                "longitude": longitude,
                "services": services,
                "consultation_fee": None,
                "phone": contact["phone"],
                "email": contact["email"],
                "source": f"KMHFL{', Google Maps' if record.get('google_name', '') else ''}",
                "is_active": record.get("status", "").lower() == "operational",
                "details": details,
                "google_place_id": record.get("google_place_id", ""),
            }
        except Exception as e:
            print(f"❌ Error transforming clinic record: {e}")
            # Save the raw record for debugging
            save_unresolved_clinic({
                "raw_record": record,
                "name": record.get("name", "Unknown"),
                "place_id": record.get("code", "")
            }, f"Transformation error: {str(e)}")
            return None

    # ---------- MAIN FUNCTION ----------
    def populate_clinics(add_embeddings: bool = True):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            clinics = json.load(f)

        print(f"📦 Loaded {len(clinics)} records from {DATA_PATH}")
        clinics = clinics[:count] if limit else clinics
        print(f"🔢 Processing {len(clinics)} due to ~ Limit: {limit} ~ constrain records...")

        inserted, skipped, errored = 0, 0, 0

        for clinic in clinics:
            try:
                data = transform(clinic)
                
                # Skip if transformation failed
                if data is None:
                    errored += 1
                    continue

                # Skip if missing name or coordinates
                if not data["name"] or data["latitude"] is None or data["longitude"] is None:
                    skipped += 1
                    print(f"⚠️ Skipping clinic with missing data: {data['name']}")
                    save_unresolved_clinic(data, "Missing name or coordinates")
                    continue

                # Check existing record
                existing = supabase.table(clinics_table).select("place_id").eq("name", data["name"]).execute()
                if existing.data:
                    print(f"⚠️ Skipping duplicate: {data['name']}")
                    skipped += 1
                    continue

                # Add embedding
                if add_embeddings:
                    try:
                        micro_port = int(os.getenv("MICROSERVICE_PORT", 8002))
                        url = f"http://localhost:{micro_port}/embed"
                        payload = {
                            "clinics": [
                                {
                                    "id": data.get("place_id"),
                                    "name": data.get("name"),
                                    "address": data.get("address"),
                                    "services": data.get("services"),
                                    "longitude": data.get("longitude"),
                                    "latitude": data.get("latitude"),
                                    "details": json.dumps(data.get("details", {})),
                                }
                            ]
                        }

                        res = requests.post(url, json=payload)
                        if res.status_code != 200:
                            print(f"❌ Embedding API failed for {data['name']}: {res.status_code} - {res.text}")
                        else:
                            output = res.json()
                            embedding = output.get("results", [{}])[0].get("embedding")
                            if embedding:
                                data["embedding"] = embedding
                    except Exception as e:
                        print(f"⚠️ Error creating embedding for {data['name']}: {e}")

                # Insert record
                res = supabase.table(clinics_table).insert(data).execute()
                if res.data:
                    print(f"✅ Inserted: {data['name']}")
                    inserted += 1
                else:
                    print(f"⚠️ Insert returned empty response for {data['name']}: {res}")
                    save_unresolved_clinic(data, "Empty response from database")
                    errored += 1

            except Exception as e:
                error_msg = str(e)
                print(f"❌ Error processing clinic: {error_msg}")
                # Try to get at least the name for error reporting
                clinic_name = clinic.get("name", "Unknown") if isinstance(clinic, dict) else "Unknown"
                save_unresolved_clinic({
                    "name": clinic_name,
                    "place_id": clinic.get("code", "") if isinstance(clinic, dict) else "",
                    "raw_record": clinic
                }, f"Processing error: {error_msg}")
                errored += 1
                # Don't print full traceback for expected errors, just log the issue

        print(f"\n🏁 Done! Inserted: {inserted}, Skipped: {skipped}, Errored: {errored}, Total Processed: {(len(clinics[:count]) if limit else len(clinics)) - skipped}")

    populate_clinics()

def seed_appointments(supabase: Client, user_ids: List[int], clinic_ids: List[int], count: int = 10) -> List[int]:
	statuses = ["pending", "confirmed", "cancelled"]
	appointments_payload: List[Dict] = []
	start_day = date.today()
	for i in range(count):
		appt_date = start_day + timedelta(days=random.randint(0, 14))
		appt_time = time(hour=random.randint(8, 16), minute=random.choice([0, 15, 30, 45]))
		appointments_payload.append(
			{
				"user_id": random.choice(user_ids),
				"clinic_id": random.choice(clinic_ids),
				"date": appt_date.isoformat(),
				"time": appt_time.strftime("%H:%M:%S"),
				"status": random.choice(statuses),
			}
		)

	resp = supabase.table("appointments").insert(appointments_payload).execute()
	inserted = resp.data if hasattr(resp, "data") else resp["data"]
	return [row["appointment_id"] for row in inserted]


def seed_reviews(supabase: Client, user_ids: List[int], clinic_ids: List[int], count: int = 10) -> List[int]:
	review_comments = [
		"Great service!", "Very professional staff.", "Clean facilities.", "Wait time was short.",
		"Highly recommend.", "Could be better.", "Friendly doctors.", "Excellent care.",
		"Average experience.", "Will visit again.",
	]
	reviews_payload: List[Dict] = []
	for i in range(count):
		reviews_payload.append(
			{
				"user_id": random.choice(user_ids),
				"clinic_id": random.choice(clinic_ids),
				"rating": random.randint(3, 5),
				"comment": review_comments[i % len(review_comments)],
			}
		)

	resp = supabase.table("reviews").insert(reviews_payload).execute()
	inserted = resp.data if hasattr(resp, "data") else resp["data"]
	return [row["review_id"] for row in inserted]


def main() -> None:
    # Initialize unresolved seed tracking
    initialize_unresolved_file()
    
    supabase = get_supabase_client()
    # seed base tables first
    clinic_ids = seed_clinics(supabase, count=10)
    # dependent tables
    # user_ids = seed_users(supabase, 10)
    # seed_appointments(supabase, user_ids, clinic_ids, 10)
    # seed_reviews(supabase, user_ids, clinic_ids, 10)
    print("Seeding complete.")


if __name__ == "__main__":
	main()