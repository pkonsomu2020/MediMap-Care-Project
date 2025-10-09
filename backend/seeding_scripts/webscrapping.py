"""
KMHFL Data Scraper
------------------

This script extracts facility information from the Kenya Master Health Facility List (KMHFL).

It works in two main phases:
    1. Fetch general facility data from the public API (paged results).
    2. For each facility ID, fetch detailed information from the public website.

Both phases write to JSON files incrementally (streaming mode) to minimize memory usage.
This approach allows handling thousands of records without filling RAM.

Author: [Your Name]
Date: [Today’s Date]
"""

import json
import requests
import time
import os
from bs4 import BeautifulSoup
import googlemaps
from dotenv import load_dotenv
from typing import List, Dict, Any
# ============================================================
# --- GLOBAL CONFIGURATION ---
# ============================================================

# API endpoint for paginated list of facilities
GENERAL_LIST_URL = (
    "https://api.kmhfr.health.go.ke/api/facilities/facilities/"
    "?approved_national_level=true"
    "&fields=id%2Ccode%2Cname%2Cregulatory_status_name%2Cfacility_type_name%2Cowner_name"
    "%2Ccounty%2Cconstituency%2Cward_name%2Ckeph_level_name%2Coperation_status_name&page=1"
)

# Base URL for individual facility detail pages (HTML)
DETAIL_API_BASE_URL = "https://kmhfl.health.go.ke/public/facilities/"

# HTTP headers for API calls
AUTH_TOKEN = ""
HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Accept": "application/json"
}

# Places API
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Output file paths
relative_path = os.path.dirname(__file__)
GENERAL_OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "all_kmhfl_facilities_general.json")
DETAIL_OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "all_kmhfl_facilities_details.json")

# Optional runtime limits (for testing or controlled runs)
MAX_PAGE_COUNT = 1              # Max number of pages to fetch (None = all)
MAX_FACILITIES_FOR_DETAIL = 3  # Max facilities for Phase 2 (None = all)


# ============================================================
# --- STREAM FILE HELPERS ---
# ============================================================

def start_stream(file_path: str):
    """
    Initialize a JSON file as an open array for streaming append operations.

    Parameters:
        file_path (str): Path of the file to initialize.
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('[\n')


def append_stream(file_path: str, data: dict, is_first_entry: bool):
    """
    Append a JSON object to an open array file, formatted properly.

    Parameters:
        file_path (str): Target JSON file.
        data (dict): Dictionary to serialize and append.
        is_first_entry (bool): Whether this is the first element (controls comma placement).
    """
    json_string = json.dumps(data, ensure_ascii=False, indent=4)
    with open(file_path, 'a', encoding='utf-8') as f:
        if not is_first_entry:
            f.write(',\n')  # Add comma before all but the first entry
        f.write(json_string)


def end_stream(file_path: str):
    """
    Close the open JSON array by appending a closing bracket.

    Parameters:
        file_path (str): Path of the JSON file to close.
    """
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write('\n]')


# ============================================================
# --- FACILITY DETAIL EXTRACTION (HTML PARSING) ---
# ============================================================

home_page = "https://kmhfl.health.go.ke/public/facilities"

# ============================================================
# --- Google maps additional info ---
# ============================================================

FIELDS = ['place_id', 'formatted_address', 'name', 'geometry']

# Initialize the Google Maps client
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

# --- Functions ---

def google_find_place(place_name: str, detailed: bool= True) -> dict | None:
    """Uses Text Search to find the Place ID for a given place name."""
    try:
        # Use 'Text Search' to find the most relevant place
        search_result = gmaps.find_place(
            input=place_name,
            input_type='textquery',
            fields=FIELDS
        )        
        if search_result.get('candidates'):
            if not detailed:
                place_id = search_result['candidates'][0]['place_id']
                return {"google_place_id": place_id}
            print(f"✅ Found ID for '{place_name}': {search_result['candidates'][0]['place_id']}")
            return {
                "formatted_address": search_result['candidates'][0]["formatted_address"],
                "google_name": search_result['candidates'][0]["name"],
                "google_location": search_result['candidates'][0]["geometry"]["location"]
                }
        else:
            print(f"❌ No results found for '{place_name}'.")
            return None
    except Exception as e:
        print(f"An error occurred during search for '{place_name}': {e}")
        return None

# ============================================================

def extract_general_data(html: str):
    """
    Extracts general data (including token, facility data, etc.) from a Next.js rendered HTML page.

    Args:
        html (str): The full HTML source code of the page.

    Returns:
        dict: Parsed JSON content from the __NEXT_DATA__ script block.
    """
    soup = BeautifulSoup(html, "html.parser")
    script_tag = soup.find("script", {"id": "__NEXT_DATA__"})

    if not script_tag or not script_tag.string:
        raise ValueError("Could not find __NEXT_DATA__ script block in the HTML.")

    try:
        data = json.loads(script_tag.string)
        return data
    except json.JSONDecodeError as e:
        raise ValueError("Failed to parse JSON from __NEXT_DATA__: " + str(e))
    
def extract_token(html: str) -> str:
    """
    Extracts the token value from a Next.js HTML page containing __NEXT_DATA__.
    """
    data = extract_general_data(html)

    # Traverse safely to where token usually lives
    try:
        token = data["props"]["pageProps"]["token"]
        return token, data
    except KeyError:
        raise ValueError("Token not found in parsed data structure.")

def extract_facility_details(html: str, google_data:bool = True) -> dict:
    """
    Extract detailed facility data from a KMHFL facility webpage.

    KMHFL facility pages are rendered with Next.js and contain JSON data
    inside a <script id="__NEXT_DATA__" type="application/json"> tag.

    This function parses that script and extracts key fields.

    Parameters:
        html (str): The full HTML source of the facility page.
        google_data (bool): Whether to fetch additional data from Google Places API.

    Returns:
        dict: Structured data extracted from the embedded JSON.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Locate the embedded JSON data from the Next.js app
    script_tag = soup.find("script", {"id": "__NEXT_DATA__"})
    if not script_tag:
        raise ValueError("No __NEXT_DATA__ script found in HTML")

    # Parse the JSON from inside the script tag
    data = json.loads(script_tag.string)

    # Navigate to the facility-specific data object
    facility_data = data["props"]["pageProps"]["data"]

    # Extract the relevant facility details from the nested structure
    facility_info = {
        "id": facility_data.get("id"),
        "name": facility_data.get("name"),
        "code": facility_data.get("code"),
        "type": facility_data.get("facility_type_name"),
        "owner": facility_data.get("owner_name"),
        "county": facility_data.get("county_name"),
        "sub_county": facility_data.get("sub_county_name"),
        "ward": facility_data.get("ward_name"),
        "keph_level": facility_data.get("keph_level_name"),
        "status": facility_data.get("operation_status_name"),
        "admission_status": facility_data.get("admission_status_name"),
        "contacts": [c.get("contact") for c in facility_data.get("facility_contacts", [])],
        "services": [
            {"category": s["category_name"], "service": s["service_name"]}
            for s in facility_data.get("facility_services", [])
        ],
        "infrastructure": [
            i["infrastructure_name"] for i in facility_data.get("facility_infrastructure", [])
        ],
        "human_resources": [
            {
                "name": h["name"],
                "category": h["speciality_category_name"],
                "count": h["count"],
            }
            for h in facility_data.get("facility_humanresources", [])
        ],
        "coordinates": facility_data.get("lat_long"),
        "location_desc": facility_data.get("location_desc"),
        "catchment_population": facility_data.get("facility_catchment_population"),
        "date_established": facility_data.get("date_established"),
    }

    # Optionally enrich with Google Places data
    if google_data and facility_info.get("name"):
        google_place_data = google_find_place(facility_info["name"])
        if google_place_data:
            facility_info.update(google_place_data)
    return facility_info

def write_facilities_to_file(data: dict, filename: str):
    """
    Extracts facility info from API-like response and writes
    only the important fields to a JSON file as a clean list.

    This version always writes a brand-new file that starts with '['.
    It never appends or leaves dangling commas.
    """

    # Step 1: safely get results list
    try:
        facilities = data["props"]["pageProps"]["data"]["results"]
    except KeyError:
        raise ValueError("Unexpected data structure — could not find 'results' in data")

    # Step 2: select only the important fields
    clean_list = []
    for f in facilities:
        clean_list.append({
            "id": f.get("id"),
            "regulatory_status_name": f.get("regulatory_status_name"),
            "facility_type_name": f.get("facility_type_name"),
            "owner_name": f.get("owner_name"),
            "operation_status_name": f.get("operation_status_name"),
            "county": f.get("county"),
            "constituency": f.get("constituency"),
            "ward_name": f.get("ward_name"),
            "keph_level_name": f.get("keph_level_name"),
            "name": f.get("name"),
            "code": f.get("code"),
        })

    # Step 3: overwrite file with a clean JSON array
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(clean_list, f, ensure_ascii=False, indent=4)

    print(f"✅ Wrote {len(clean_list)} facilities to {filename}")
    return len(clean_list)

# ============================================================
# --- PHASE 1: STREAMED GENERAL DATA FETCHING ---
# ============================================================

def fetch_all_general_data() -> int:
    """
    Fetches all general facility data from the KMHFL API (paginated).

    This function streams the facility data directly into a JSON file
    (`all_kmhfl_facilities_general.json`) without storing all pages in memory.

    Returns:
        int: Total number of facilities successfully written to file.
    """
    print("--- PHASE 1: General Facility Data ---")

    current_url = GENERAL_LIST_URL
    page_count = 0
    total_facilities = 0
    first_entry = True

    start_stream(GENERAL_OUTPUT_FILE)

    try:
        while current_url:
            page_count += 1

            if page_count == 1:
                try:
                    resonse = requests.get(home_page)
                    resonse.raise_for_status()
                    AUTH_TOKEN, data = extract_token(resonse.text)
                    HEADERS["Authorization"] = f"Bearer {AUTH_TOKEN}"
                    total_facilities = write_facilities_to_file(data, GENERAL_OUTPUT_FILE)
                    continue
                
                except Exception as e:
                    print(f"❌ Error fetching auth token: {e}")
                    continue
            
            # Stop early if max page count is set
            if MAX_PAGE_COUNT and page_count > MAX_PAGE_COUNT:
                print(f"Reached MAX_PAGE_COUNT ({MAX_PAGE_COUNT}). Stopping pagination.")
                break

            try:
                response = requests.get(current_url, headers=HEADERS)
                response.raise_for_status()
                data = response.json()
                facilities = data.get("results", [])

                # Append each facility incrementally to output
                for facility in facilities:
                    append_stream(GENERAL_OUTPUT_FILE, facility, is_first_entry=first_entry)
                    first_entry = False
                    total_facilities += 1

                print(f"✅ Page {page_count} processed ({len(facilities)} facilities). "
                      f"Total so far: {total_facilities}")

                # Continue to next page if available
                current_url = data.get("next")

                # Be polite to the API
                time.sleep(1)

            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching page {page_count}: {e}")
                break

    finally:
        end_stream(GENERAL_OUTPUT_FILE) if page_count != 2 else None # It's two since we already wrote the first page in write_facilities_to_file
        print(f"\nPhase 1 complete. {total_facilities} facilities written to {GENERAL_OUTPUT_FILE}.")

    return total_facilities


# ============================================================
# --- PHASE 2: STREAMED DETAILED DATA FETCHING ---
# ============================================================

def fetch_all_detail_data():
    """
    Fetch detailed data for each facility ID obtained in Phase 1.

    The function reads facility IDs from the general data file,
    visits each public facility page, parses embedded JSON, and
    writes detailed data to `all_kmhfl_facilities_details.json`.

    Uses HTML parsing since the detail endpoint is a React-rendered page,
    not a JSON API.
    """
    print("\n--- PHASE 2: Detailed Facility Data ---")

    if not os.path.exists(GENERAL_OUTPUT_FILE):
        print(f"General data file '{GENERAL_OUTPUT_FILE}' not found.")
        return

    start_stream(DETAIL_OUTPUT_FILE)
    first_entry = True
    processed_count = 0

    try:
        # Load all facility objects from the general output
        with open(GENERAL_OUTPUT_FILE, 'r', encoding='utf-8') as f:
            general_data = json.load(f)

        # Iterate through each facility record
        for facility in general_data:
            # Stop early if limit set for testing
            if MAX_FACILITIES_FOR_DETAIL and processed_count >= MAX_FACILITIES_FOR_DETAIL:
                print(f"Reached MAX_FACILITIES_FOR_DETAIL ({MAX_FACILITIES_FOR_DETAIL}). Stopping.")
                break

            facility_id = facility.get("id")
            if not facility_id:
                continue  # skip incomplete entries

            detail_url = f"{DETAIL_API_BASE_URL}{facility_id}"

            try:
                response = requests.get(detail_url)
                response.raise_for_status()

                # The detail endpoint returns HTML; extract embedded JSON data
                detail_data = extract_facility_details(response.text)
                print(detail_data)

                append_stream(DETAIL_OUTPUT_FILE, detail_data, is_first_entry=first_entry)
                first_entry = False
                processed_count += 1

                print(f"✅ Processed facility {processed_count}: {facility_id}")
                time.sleep(1)  # delay between requests

            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching detail for ID {facility_id}: {e}")
                continue

            except Exception as e:
                print(f"❌ Parsing error for facility {facility_id}: {e}")
                continue

    finally:
        # Always close the JSON array properly, even on errors
        end_stream(DETAIL_OUTPUT_FILE)
        print(f"\nPhase 2 complete. {processed_count} detailed records written to {DETAIL_OUTPUT_FILE}.")


# ============================================================
# --- MAIN EXECUTION ---
# ============================================================

if __name__ == "__main__":
    total = fetch_all_general_data()

    if total > 0:
        fetch_all_detail_data()
    else:
        print("No facilities retrieved in Phase 1. Skipping Phase 2.")
