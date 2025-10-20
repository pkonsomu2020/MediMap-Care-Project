import os
import random
from datetime import date, time, timedelta, datetime
from typing import List, Dict
import bcrypt, json

from dotenv import load_dotenv
from supabase import create_client, Client


def get_supabase_client() -> Client:
	load_dotenv()
	url: str = os.environ.get("SUPABASE_URL")
	key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
	if not url or not key:
		raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment")
	return create_client(url, key)


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


def seed_clinics(supabase: Client, count: int = 10) -> List[int]:
	# Path to the scraper output
	DATA_PATH = "all_kmhfl_facilities_details.json"

	# ------------- LOAD & CLEAN DATA -------------
	def transform(record):
			"""Convert your scraper's data format into your table schema."""
			name = record.get("name")
			contact = record.get("contacts", [None])[0]  # take first phone number if any
			coords = record.get("coordinates", [None, None])
			latitude, longitude = coords if len(coords) == 2 else (None, None)

			# join service names into a comma-separated string
			services = ", ".join([s["service"] for s in record.get("services", []) if s.get("service")])

			return {
					"name": name,
					"address": f"{record.get('ward', '')}, {record.get('sub_county', '')}, {record.get('county', '')}".strip(", "),
					"latitude": latitude,
					"longitude": longitude,
					"services": services,
					"consultation_fee": None,
					"contact": contact,
			}

	# ------------- MAIN INSERT FUNCTION -------------
	def populate_clinics():
			with open(DATA_PATH, "r", encoding="utf-8") as f:
					clinics = json.load(f)

			print(f"Loaded {len(clinics)} records from {DATA_PATH}")

			inserted = 0
			skipped = 0

			for clinic in clinics:
					data = transform(clinic)

					# Skip entries without name or coordinates
					if not data["name"] or not data["latitude"] or not data["longitude"]:
							skipped += 1
							continue

					# Check for existing clinic (by name)
					existing = supabase.table("clinics").select("clinic_id").eq("name", data["name"]).execute()

					if existing.data:
							skipped += 1
							continue

					# Insert new record
					res = supabase.table("clinics").insert(data).execute()
					if res.error:
							print(f"Error inserting {data['name']}: {res.error}")
					else:
							inserted += 1
							print(f"Inserted: {data['name']}")

			print(f"\n✅ Done! Inserted: {inserted} of {len(clinics)}, Skipped: {skipped}")
	
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
	supabase = get_supabase_client()
	# seed base tables first
	user_ids = seed_users(supabase, 10)
	clinic_ids = seed_clinics(supabase, 10)
	# dependent tables
	seed_appointments(supabase, user_ids, clinic_ids, 10)
	seed_reviews(supabase, user_ids, clinic_ids, 10)
	print("Seeding complete.")


if __name__ == "__main__":
	main()


