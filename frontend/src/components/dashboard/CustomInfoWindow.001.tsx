import React, { useState, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

// Define the structure for the props this component will accept
interface CustomInfoWindowProps {
  placeId: string;
  onClose: () => void;
}

// Define the expected structure of the place details we fetch
interface PlaceDetails {
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress: string;
  types?: string[];
  openingHours?: { isOpen: () => boolean };
  website?: string;
  url: string; // Google Maps URL for the place
  photos?: { getUrl: (opts?: object) => string }[];
  wheelchairAccessibleEntrance?: boolean;
}

export const CustomInfoWindow = ({ placeId, onClose }: CustomInfoWindowProps) => {
  // Get the Places Service library from the Google Maps API
  const places = useMapsLibrary('places');
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);

  useEffect(() => {
    // Ensure the Places Service is available before using it
    if (!places || !placeId) return;

    // Create a new PlacesService instance
    const service = new places.PlacesService(document.createElement('div'));

    // Define the fields we want to fetch for the place
    const request = {
      placeId: placeId,
      fields: [
        'name',
        'rating',
        'user_ratings_total',
        'formatted_address',
        'types',
        'opening_hours',
        'url',
        'photos',
        'wheelchair_accessible_entrance'
      ],
    };

    // Fetch the place details
    service.getDetails(request, (place, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        place
      ) {
        setPlaceDetails({
          name: place.name || 'No name available',
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          formattedAddress: place.formatted_address || '',
          types: place.types,
          openingHours: place.opening_hours as { isOpen: () => boolean } | undefined,
          url: place.url || '',
          photos: place.photos as { getUrl: (opts?: object) => string }[] | undefined,
          wheelchairAccessibleEntrance: place['wheelchair_accessible_entrance'],
        });
      }
    });
  }, [places, placeId]);

  // Helper function to capitalize the place type (e.g., 'hospital' -> 'Hospital')
  const formatPlaceType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  // Render a loading state or nothing if details haven't been fetched yet
  if (!placeDetails) {
    return null;
  }

  // Styles for the component to match your image
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      fontFamily: 'Arial, sans-serif',
      width: '350px',
      background: 'linear-gradient(135deg, #2D9A7A, #34D399)',
      borderRadius: '12px',
      padding: '15px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
      flexGrow: 1,
    },
    iconButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '5px',
      marginLeft: '8px',
    },
    content: {
      display: 'flex',
      gap: '12px',
    },
    photo: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      objectFit: 'cover',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    ratingLine: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    star: {
      color: '#FFD700', // Gold color for the star
    },
    infoLine: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    footer: {
      fontSize: '0.8rem',
      opacity: 0.9,
      marginTop: '5px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header with Title and Buttons */}
      <div style={styles.header}>
        <h2 style={styles.title}>{placeDetails.name}</h2>
        <a href={placeDetails.url} target="_blank" rel="noopener noreferrer" style={styles.iconButton} aria-label="Open in Google Maps">
          {/* External Link SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
        <button onClick={onClose} style={styles.iconButton} aria-label="Close">
          {/* Close 'X' SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={styles.content}>
        {placeDetails.photos && (
          <img src={placeDetails.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })} alt={placeDetails.name} style={styles.photo} />
        )}
        <div style={styles.details}>
          {placeDetails.rating && (
            <div style={styles.ratingLine}>
              <span>{placeDetails.rating.toFixed(1)}</span>
              <span style={styles.star}>★</span>
              <span>({placeDetails.userRatingsTotal})</span>
            </div>
          )}
          <div style={styles.infoLine}>
            {placeDetails.types && <span>{formatPlaceType(placeDetails.types[0])}</span>}
            {placeDetails.wheelchairAccessibleEntrance && <span>♿</span>}
          </div>
          {placeDetails.openingHours && (
            <span>{placeDetails.openingHours.isOpen() ? 'Open now' : 'Closed'}</span>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div style={styles.footer}>
        <span>Google Maps</span>
      </div>
    </div>
  );
};