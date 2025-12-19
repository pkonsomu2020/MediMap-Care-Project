import { InfoWindow } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

interface PlaceDetailsInfoWindowProps {
  placeId: string;
  onCloseClick: () => void;
  position: { lat: number; lng: number };
}

// This is a React wrapper for the Google Maps Platform Web Component.
const PlaceDetailsCompact = ({ placeId }: { placeId: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = contentRef;
    if (!current) return;

    // Create the outer web component element
    const placeDetailsEl = document.createElement('gmp-place-details-compact');
    placeDetailsEl.setAttribute('orientation', 'horizontal');
    placeDetailsEl.setAttribute('truncation-preferred', '');

    // Create the inner request element
    const placeRequestEl = document.createElement('gmp-place-details-place-request');
    placeRequestEl.setAttribute('place', placeId);

    // Create the content config element
    const contentConfigEl = document.createElement('gmp-place-content-config');
    contentConfigEl.innerHTML = `
      <gmp-place-media lightbox-preferred></gmp-place-media>
      <gmp-place-rating></gmp-place-rating>
      <gmp-place-type></gmp-place-type>
      <gmp-place-price></gmp-place-price>
      <gmp-place-accessible-entrance-icon></gmp-place-accessible-entrance-icon>
      <gmp-place-open-now-status></gmp-place-open-now-status>
    `;

    // Assemble the component
    placeDetailsEl.appendChild(placeRequestEl);
    placeDetailsEl.appendChild(contentConfigEl);

    // Clear the container and append the new element
    current.innerHTML = '';
    current.appendChild(placeDetailsEl);

  }, [placeId]);

  return <div ref={contentRef} />;
};


export const PlaceDetailsInfoWindow = ({ placeId, position, onCloseClick }: PlaceDetailsInfoWindowProps) => {
  return (
    <InfoWindow position={position} onCloseClick={onCloseClick} >
      <div style={{ width: '380px', padding: '5px' }}>
        <PlaceDetailsCompact placeId={placeId} />
      </div>
    </InfoWindow>
  );
};