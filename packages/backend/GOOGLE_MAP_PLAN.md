

## 🧠 Step-by-Step Logic & Setup Plan

### 🩺 Goal

> Fetch nearby hospitals/clinics using Google APIs → store them in Supabase → display first 5 in frontend → support navigation & distance/time calculation when user selects a facility.

---

## 🧩 1. **Core Components**

| Component                      | Purpose                                                   | Example API                                              |
| ------------------------------ | --------------------------------------------------------- | -------------------------------------------------------- |
| **Google Places API (New)**    | Get hospital/clinic details (name, rating, address, etc.) | `places:searchNearby`                                    |
| **Google Geocoding API**       | Convert coordinates ↔ address                             | `geocode:reverseGeocode`                                 |
| **Google Distance Matrix API** | Calculate time/distance between user & hospital           | `distanceMatrix:computeRoutes`                           |
| **Google Directions API**      | Get step-by-step navigation route                         | `directions:computeRoutes`                               |
| **Google Maps URL Scheme**     | Optionally open Google Maps app for live navigation       | `https://www.google.com/maps/dir/?api=1&destination=...` |
| **Supabase**                   | Persist fetched hospital data                             | `public.clinics`                                         |
| **Frontend (React)**           | Show nearby hospitals, initiate directions                | `useQuery()` + `Leaflet.js`                              |

---

## 🗺️ 2. **Flow Logic**

### 🔹 Phase 1: Initialization

* User opens the app.
* App requests permission for **current location** via Geolocation API.
* You store the coordinates temporarily (e.g., `lat`, `lng` in React state).

```plaintext
User Location  → {lat: -1.2921, lng: 36.8219}
```

---

### 🔹 Phase 2: Fetch Hospitals

You’ll call **Google Places API (Nearby Search)** like:

```
https://places.googleapis.com/v1/places:searchNearby
```

**Params:**

* `location` (user’s lat/lng)
* `radius` (e.g., 5000 meters)
* `type` = `hospital` or user’s requested service (`dentist`, `clinic`, etc.)

**Returns:**

* Name, address, rating, user_ratings_total, location, business_status, place_id

---

### 🔹 Phase 3: Save to Supabase

After fetching, check duplicates and insert new data:

| Column             | Source                                  |
| ------------------ | --------------------------------------- |
| `name`             | `result.displayName.text`               |
| `address`          | `result.formattedAddress`               |
| `latitude`         | `result.location.latitude`              |
| `longitude`        | `result.location.longitude`             |
| `rating`           | `result.rating`                         |
| `services`         | user query keyword or API `types` field |
| `category`         | `hospital` / `clinic` / `pharmacy`      |
| `consultation_fee` | *left null (manual)*                    |

💡 **Optimization Tip:**
Use an **upsert** operation (`insert ... on conflict (name, address) do nothing`) to avoid duplicates and save API quota.

---

### 🔹 Phase 4: Display Results in Frontend

* Fetch first 5 hospitals from Supabase (`SELECT * FROM clinics LIMIT 5`).
* Display them on map & list.
* Include:

  * Distance (computed from `Distance Matrix API`)
  * Rating
  * “Navigate” button

---

### 🔹 Phase 5: Navigation / Directions

Two options:

#### 🅰 Option 1 — Native Google Maps App (Recommended for hackathon)

When user clicks **Start Journey**:

* Redirect them to Google Maps app:

```
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}
```

✅ Simple
✅ No quota usage
✅ Free
❌ Leaves your app temporarily

#### 🅱 Option 2 — In-App Navigation

If you want navigation **inside your app**:

* Use **Directions API** to get route data
* Draw route using **Leaflet Polyline**
* Optionally update ETA in real-time with **Distance Matrix API**

✅ Fully in-app
❌ Consumes API quota
❌ Slightly complex

---

## ⚙️ 3. **API Cost & Quotas**

| API                       | Free Tier                                 | Est. Cost After Free |
| ------------------------- | ----------------------------------------- | -------------------- |
| **Places API (New)**      | $200/month free credit (~1000–1500 calls) | ~$17 per 1k calls    |
| **Geocoding API**         | Included in $200 free                     | ~$5 per 1k calls     |
| **Distance Matrix API**   | Included in $200 free                     | ~$10 per 1k calls    |
| **Directions API**        | Included in $200 free                     | ~$5 per 1k calls     |
| **Maps Embed/URL Scheme** | ✅ Free                                    | Free                 |

💡 For hackathon purposes, your **$200 monthly free credit** on a Google Cloud project is **more than enough** if:


* **Cache & upsert** results in Supabase

---

## 🧭 4. **Supabase Integration Plan**

You’ll need:

* **Table:** `clinics` (already perfect)
* **Add one more optional column:**
  `google_place_id text unique` → for tracking duplicates easily.

```sql
ALTER TABLE public.clinics ADD COLUMN google_place_id text UNIQUE;
```

---

## 🔐 5. **Security Plan**

* Don’t expose Google API key in frontend.
  → Use **backend proxy endpoint** (e.g. `/api/fetchPlaces`) that calls the API and stores data.
* Frontend calls backend → Backend calls Google → Supabase updated.

---

## 🧩 6. **Summary Architecture Diagram**

```plaintext
┌─────────────┐
│   Frontend  │
│ (React App) │
└─────┬───────┘
      │
      ▼
┌──────────────┐
│  Express API │  (Server)
│ /fetchPlaces │──► Calls Google APIs
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Supabase DB │
│ (Clinics etc.)│
└──────────────┘
      │
      ▼
┌──────────────┐
│  Google APIs │
│ Places, Dist │
└──────────────┘
```

---

## 🧩 7. **Next Step Recommendations**

1. ✅ Add `google_place_id` column to Supabase.
2. ⚙️ Set up Google Cloud project + enable APIs.
3. 🗝️ Generate **API key** with IP restrictions.
4. 🧠 Create a backend endpoint `/api/fetchPlaces`.
5. 💾 Upsert results into Supabase.
6. 📍 Build frontend page that:

   * Gets user location
   * Fetches nearby hospitals
   * Offers “Start Navigation” button (opens Google Maps app)

---

Would you like me to show the **backend endpoint logic** (in TypeScript, using Express + Supabase client) for `/api/fetchPlaces` — optimized for hackathon limits and caching?
