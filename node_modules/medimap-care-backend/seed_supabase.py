import os
import random
from datetime import date, time, timedelta, datetime
from typing import List, Dict

from dotenv import load_dotenv
from supabase import create_client, Client


def get_supabase_client() -> Client:
	load_dotenv()
	url: str = os.environ.get("SUPABASE_URL")
	key: str = os.environ.get("SUPABASE_KEY")
	if not url or not key:
		raise RuntimeError("SUPABASE_URL or SUPABASE_KEY not set in environment")
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
		users_payload.append(
			{
				"name": name,
				"email": email,
				"password": "Password123!",  # sample only; hashed in real apps
				"phone": f"+1-555-01{str(i).zfill(2)}",
				"role": "user",
			}
		)

	resp = supabase.table("users").insert(users_payload).execute()
	# Supabase Python client returns dict-like with data list
	inserted = resp.data if hasattr(resp, "data") else resp["data"]
	return [row["user_id"] for row in inserted]


def seed_clinics(supabase: Client, count: int = 10) -> List[int]:
	clinic_names = [
		"MediCare Clinic", "HealthFirst Center", "Wellness Point", "CityCare Clinic",
		"Prime Health Hub", "Sunrise Medical", "Green Valley Clinic", "Harbor Health",
		"Riverside Care", "North Star Clinic",
	]
	services_options = [
		"General Checkup, Vaccination, Pediatrics",
		"Dental, Orthodontics, Oral Surgery",
		"Cardiology, Diagnostics, Imaging",
		"Dermatology, Allergy Testing",
		"Orthopedics, Physiotherapy",
	]
	clinics_payload: List[Dict] = []
	for i in range(count):
		lat = round(random.uniform(-90, 90), 6)
		lng = round(random.uniform(-180, 180), 6)
		clinics_payload.append(
			{
				"name": clinic_names[i % len(clinic_names)] + f" #{i+1}",
				"address": f"{100 + i} Main Street",
				"latitude": lat,
				"longitude": lng,
				"services": services_options[i % len(services_options)],
				"consultation_fee": round(random.uniform(15, 80), 2),
				"contact": f"+1-800-555-1{str(i).zfill(2)}",
				"rating": round(random.uniform(3.0, 5.0), 2),
			}
		)

	resp = supabase.table("clinics").insert(clinics_payload).execute()
	inserted = resp.data if hasattr(resp, "data") else resp["data"]
	return [row["clinic_id"] for row in inserted]


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


