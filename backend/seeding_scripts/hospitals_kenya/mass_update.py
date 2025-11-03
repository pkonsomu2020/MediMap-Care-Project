# mass_update.py
import json
import os
import requests
from supabase import create_client
from dotenv import load_dotenv, find_dotenv
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clinic_update_errors.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = find_dotenv(".env", raise_error_if_not_found=False)
if env_path:
    load_dotenv(env_path)
    logger.info(f"✅ Loaded environment from: {env_path}")
else:
    logger.warning("⚠️ .env not found — falling back to default .env")
    load_dotenv(find_dotenv(".env", raise_error_if_not_found=False))

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_CLINICS", "clinics")
MICROSERVICE_URL = f'http://localhost:{os.getenv("MICROSERVICE_PORT", "8000")}'

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials in environment variables.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Global variable to track processing results
processing_data = {
    "timestamp": datetime.now().isoformat(),
    "summary": {
        "total_processed": 0,
        "successful_updates": 0,
        "failed_updates": 0,
        "skipped": 0
    },
    "successful_updates": [],
    "failed_updates": [],
    "errors": []
}

def save_processing_data_to_file():
    """Save processing data to JSON file"""
    try:
        with open("clinic_update_results.json", "w", encoding="utf-8") as f:
            json.dump(processing_data, f, indent=2, ensure_ascii=False)
        logger.info("💾 Processing results saved to clinic_update_results.json")
    except Exception as e:
        logger.error(f"❌ Failed to save processing data to file: {e}")

def extract_services_string(services_data):
    """
    Convert services data into a single string.
    Handles list of objects, list of strings, or string formats.
    """
    if not services_data:
        return ""
    
    # If it's already a string, return as is
    if isinstance(services_data, str):
        return services_data
    
    # If it's a list, process each item
    if isinstance(services_data, list):
        all_services = []
        
        for item in services_data:
            if isinstance(item, dict):
                # Extract service name from object
                service_name = item.get('service', '')
                category = item.get('category', '')
                
                if service_name:
                    # Include category for context if available
                    if category:
                        all_services.append(f"{category}: {service_name}")
                    else:
                        all_services.append(service_name)
            elif isinstance(item, str):
                # If it's already a string, just add it
                all_services.append(item)
        
        # Join all services with semicolons for readability
        return "; ".join(all_services)
    
    # Fallback: convert to string
    return str(services_data)

def prepare_update_payload(clinic):
    """
    Prepare the update payload from clinic data according to UpdateClinicRequest model.
    """
    try:
        # Extract and format services
        services_string = extract_services_string(clinic.get("services"))
        
        # Prepare payload according to UpdateClinicRequest model
        payload = {
            "name": clinic.get("name", ""),
            "address": clinic.get("address", ""),
            "services": services_string,
            "longitude": float(clinic.get("longitude", 0.0)),
            "latitude": float(clinic.get("latitude", 0.0)),
            "source": clinic.get("source", "")
        }
        
        # Validate required fields
        if not payload["name"]:
            logger.warning(f"⚠️ Clinic {clinic.get('clinic_id')} has empty name")
        
        if not payload["address"]:
            logger.warning(f"⚠️ Clinic {clinic.get('clinic_id')} has empty address")
        
        return payload
        
    except Exception as e:
        logger.error(f"❌ Error preparing payload for clinic {clinic.get('clinic_id')}: {e}")
        return None

def send_update_request(clinic, payload):
    """Send update request to the /update endpoint"""
    try:
        update_url = f"{MICROSERVICE_URL}/update"
        
        logger.info(f"📤 Sending update request for clinic ID: {clinic.get('clinic_id')}")
        logger.info(f"   Name: {payload['name']}")
        logger.info(f"   Address: {payload['address'][:100]}...")
        logger.info(f"   Services: {payload['services'][:100]}...")
        logger.info(f"   Coordinates: ({payload['latitude']}, {payload['longitude']})")
        logger.info(f"   Source: {payload['source']}")
        
        response = requests.post(update_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Successfully updated clinic {clinic.get('clinic_id')}: {result}")
            return True, result
        else:
            logger.error(f"❌ Failed to update clinic {clinic.get('clinic_id')}: {response.status_code} - {response.text}")
            return False, f"HTTP {response.status_code}: {response.text}"
            
    except requests.exceptions.Timeout:
        error_msg = "Request timeout"
        logger.error(f"❌ Timeout updating clinic {clinic.get('clinic_id')}: {error_msg}")
        return False, error_msg
    except requests.exceptions.ConnectionError:
        error_msg = "Connection error - microservice may not be running"
        logger.error(f"❌ Connection error updating clinic {clinic.get('clinic_id')}: {error_msg}")
        return False, error_msg
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(f"❌ Error sending update request for clinic {clinic.get('clinic_id')}: {e}")
        return False, error_msg

def record_successful_update(clinic, payload, response_data):
    """Record successful update details"""
    success_entry = {
        "timestamp": datetime.now().isoformat(),
        "clinic_id": clinic.get("clinic_id"),
        "name": clinic.get("name"),
        "payload_sent": payload,
        "response": response_data,
        "clinic_data": {
            "address": clinic.get("address"),
            "latitude": clinic.get("latitude"),
            "longitude": clinic.get("longitude"),
            "services": clinic.get("services"),
            "source": clinic.get("source"),
            "category": clinic.get("category")
        }
    }
    
    processing_data["successful_updates"].append(success_entry)

def record_failed_update(clinic, payload, error_message):
    """Record failed update details"""
    error_entry = {
        "timestamp": datetime.now().isoformat(),
        "clinic_id": clinic.get("clinic_id"),
        "name": clinic.get("name"),
        "payload_sent": payload,
        "error_message": error_message,
        "clinic_data": {
            "address": clinic.get("address"),
            "latitude": clinic.get("latitude"),
            "longitude": clinic.get("longitude"),
            "services": clinic.get("services"),
            "source": clinic.get("source"),
            "category": clinic.get("category")
        }
    }
    
    processing_data["failed_updates"].append(error_entry)

def record_error(clinic, error_message):
    """Record general processing errors"""
    error_entry = {
        "timestamp": datetime.now().isoformat(),
        "clinic_id": clinic.get("clinic_id") if clinic else "unknown",
        "name": clinic.get("name") if clinic else "unknown",
        "error_message": error_message
    }
    
    processing_data["errors"].append(error_entry)

def process_clinics_batch():
    """
    Read all clinics from Supabase table and send update requests to the microservice.
    Processes clinics in batches to avoid memory issues.
    """
    try:
        logger.info("🚀 Starting clinic update process...")
        logger.info(f"🔗 Microservice URL: {MICROSERVICE_URL}")
        logger.info(f"📊 Supabase Table: {SUPABASE_TABLE}")
        
        # Fetch all clinics from Supabase
        logger.info("📥 Fetching clinics from Supabase...")
        
        response = supabase.table("clinics").select("*").execute()
        
        if not response.data:
            logger.error("❌ No clinics found in the database table {SUPABASE_TABLE}. Exiting.")
            return
        
        clinics = response.data
        logger.info(f"📊 Found {len(clinics)} clinics to process")
        
        successful_count = 0
        failed_count = 0
        skipped_count = 0
        
        for clinic in clinics:
            try:
                processing_data["summary"]["total_processed"] += 1
                clinic_id = clinic.get("clinic_id")
                
                if not clinic_id:
                    logger.warning(f"⚠️ Skipping clinic with no clinic_id: {clinic.get('name', 'Unknown')}")
                    skipped_count += 1
                    continue
                
                # Prepare the update payload
                payload = prepare_update_payload(clinic)
                if not payload:
                    logger.error(f"❌ Failed to prepare payload for clinic {clinic_id}")
                    record_error(clinic, "Failed to prepare update payload")
                    failed_count += 1
                    continue
                
                # Send update request
                success, result = send_update_request(clinic, payload)
                
                if success:
                    successful_count += 1
                    record_successful_update(clinic, payload, result)
                else:
                    failed_count += 1
                    record_failed_update(clinic, payload, result)
                
                # Small delay to avoid overwhelming the microservice
                import time
                time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"❌ Error processing clinic {clinic.get('clinic_id', 'unknown')}: {e}")
                failed_count += 1
                record_error(clinic, str(e))
        
        # Update final summary
        processing_data["summary"]["successful_updates"] = successful_count
        processing_data["summary"]["failed_updates"] = failed_count
        processing_data["summary"]["skipped"] = skipped_count
        
        logger.info(f"\n📊 Processing Summary:")
        logger.info(f"✅ Successful Updates: {successful_count} clinics")
        logger.info(f"❌ Failed Updates: {failed_count} clinics")
        logger.info(f"⏭️ Skipped: {skipped_count} clinics")
        logger.info(f"📊 Total Processed: {processing_data['summary']['total_processed']} clinics")
        
        # Save processing data to file
        save_processing_data_to_file()
        
        logger.info("🎉 Clinic update process completed!")
        
    except Exception as e:
        logger.error(f"❌ Fatal error during clinic processing: {e}")
        record_error(None, f"Fatal error: {str(e)}")
        # Save whatever data we have so far
        save_processing_data_to_file()

if __name__ == "__main__":
    process_clinics_batch()