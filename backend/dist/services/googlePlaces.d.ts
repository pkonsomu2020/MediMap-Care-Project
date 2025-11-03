interface GooglePlaceResult {
<<<<<<< HEAD
    id: string;
=======
>>>>>>> vector_search
    displayName: {
        text: string;
    };
    formattedAddress: string;
    location: {
        latitude: number;
        longitude: number;
    };
    rating?: number;
    userRatingCount?: number;
    businessStatus: string;
<<<<<<< HEAD
    types?: string[];
}
interface NearbySearchOptions {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    types?: string[];
    maxResultCount?: number;
    ranking?: 'DISTANCE' | 'POPULARITY';
    regionCode?: string;
    languageCode?: string;
}
interface NearbySearchResult {
    places: GooglePlaceResult[];
    meta: {
        query: (Omit<NearbySearchOptions, 'latitude' | 'longitude'> & {
            latitude: number;
            longitude: number;
            mixed?: boolean;
        });
    };
}
export interface GeocodeResult {
    lat: number;
    lng: number;
    formattedAddress?: string | undefined;
    placeId?: string | undefined;
}
export interface GeocodeMicroserviceResponse {
    results?: GeocodeResult[];
    result?: GeocodeResult;
    status?: string;
    message?: string;
}
type DirectionsLeg = {
    distanceText: string;
    durationText: string;
    startAddress: string;
    endAddress: string;
    steps: {
        htmlInstruction: string;
        distanceText: string;
        durationText: string;
        polyline: string;
    }[];
};
type DirectionsResponse = {
    distanceText: string;
    durationText: string;
    polyline: string;
    legs: DirectionsLeg[];
};
export declare class GooglePlacesService {
    private apiKey;
    private clinicTable;
    private baseUrl;
    private geocodeUrl;
    private directionsUrl;
    constructor();
    private calculateDistance;
    private deriveCategory;
    private logCall;
    searchNearby(options: NearbySearchOptions, microOnly?: boolean): Promise<NearbySearchResult>;
    searchNearbyHospitals(latitude: number, longitude: number, radiusMeters?: number, type?: string): Promise<GooglePlaceResult[]>;
    getPlaceDetails(placeId: string): Promise<any>;
    saveClinicsToSupabase(places: GooglePlaceResult[], userLat?: number, userLng?: number): Promise<any[]>;
    updateClinicDetails(placeId: string, details: any): Promise<any>;
    getCachedClinics(latitude: number, longitude: number, radiusKm?: number, typeList?: string[]): Promise<any[]>;
=======
    id: string;
    types?: string[];
}
export declare class GooglePlacesService {
    private apiKey;
    private baseUrl;
    constructor();
    searchNearbyHospitals(latitude: number, longitude: number, radius?: number, type?: string): Promise<GooglePlaceResult[]>;
    getPlaceDetails(placeId: string): Promise<any>;
    textSearch(query: string): Promise<any[]>;
    saveClinicsToSupabase(places: GooglePlaceResult[]): Promise<any[]>;
    updateClinicDetails(placeId: string, details: any): Promise<any>;
    getCachedClinics(latitude: number, longitude: number, radiusKm?: number): Promise<any[]>;
>>>>>>> vector_search
    getDirections(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
<<<<<<< HEAD
    }): Promise<DirectionsResponse>;
    geocodeAddress(address: string, microOnly?: boolean): Promise<GeocodeResult[]>;
    reverseGeocode(coords: {
        lat: number;
        lng: number;
    }, microOnly?: boolean): Promise<GeocodeResult>;
=======
    }): Promise<{
        distance: string;
        duration: string;
        polyline: string;
    }>;
    geocodeAddress(address: string): Promise<{
        lat: number;
        lng: number;
    }>;
    reverseGeocode(lat: number, lng: number): Promise<string>;
>>>>>>> vector_search
}
export declare const googlePlacesService: GooglePlacesService;
export {};
//# sourceMappingURL=googlePlaces.d.ts.map