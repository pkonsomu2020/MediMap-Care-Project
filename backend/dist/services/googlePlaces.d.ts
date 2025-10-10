interface GooglePlaceResult {
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
    getDirections(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
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
}
export declare const googlePlacesService: GooglePlacesService;
export {};
//# sourceMappingURL=googlePlaces.d.ts.map