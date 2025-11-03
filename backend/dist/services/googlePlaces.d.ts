interface GooglePlaceResult {
    id: string;
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
    getDirections(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): Promise<DirectionsResponse>;
    geocodeAddress(address: string, microOnly?: boolean): Promise<GeocodeResult[]>;
    reverseGeocode(coords: {
        lat: number;
        lng: number;
    }, microOnly?: boolean): Promise<GeocodeResult>;
}
export declare const googlePlacesService: GooglePlacesService;
export {};
//# sourceMappingURL=googlePlaces.d.ts.map