import React, { useEffect } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { config } from '@/config/environment';

type LatLng = { lat: number; lng: number };
type BoundsLiteral = { north: number; south: number; east: number; west: number };

type GestureHandling = 'cooperative' | 'greedy' | 'none' | 'auto' | (string & {});

export interface GoogleMapReadyContext {
  map: any;
  fitBounds: (bounds: BoundsLiteral, padding?: number) => void;
}

interface GoogleMapContainerProps {
  center?: LatLng;
  defaultZoom?: number;
  mapId?: string;
  gestureHandling?: GestureHandling;
  className?: string;
  /**
   * Called when the map instance is available. Provides a fitBounds helper.
   */
  onReady?: (ctx: GoogleMapReadyContext) => void;
  /**
   * Render props: children can be a function receiving { map } or plain React nodes.
   */
  children?: React.ReactNode | ((ctx: { map: any }) => React.ReactNode);
}

/**
 * Internal bridge that exposes the map instance via onReady and supports render props with access to map.
 */
const MapBridge: React.FC<{
  onReady?: (ctx: GoogleMapReadyContext) => void;
  children?: GoogleMapContainerProps['children'];
}> = ({ onReady, children }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const fitBounds = (bounds: BoundsLiteral, padding: number = 32) => {
      try {
        const gBounds = new (window as any).google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        );
        // Some versions expect padding as number or Padding object
        (map as any).fitBounds(gBounds, padding as any);
      } catch {
        // no-op fallback
      }
    };

    onReady?.({ map, fitBounds });
  }, [map, onReady]);

  const content =
    typeof children === 'function' ? (children as (ctx: { map: any }) => React.ReactNode)({ map }) : children;

  return <>{content}</>;
};

/**
 * GoogleMapContainer
 * - Wraps @vis.gl/react-google-maps & provides:
 *   - default zoom
 *   - mapId from config
 *   - gestureHandling default 'greedy'
 *   - onReady callback with map + fitBounds
 *   - render-props children with access to map
 */
export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  center = { lat: -1.286389, lng: 36.817223 }, // Nairobi default
  defaultZoom = 16,
  mapId = config.mapId,
  gestureHandling = 'greedy',
  className = 'w-full h-full',
  onReady,
  children,
}) => {
  return (
    <div className={className}>
      <Map
        center={center}
        defaultZoom={defaultZoom}
        mapId={mapId}
        gestureHandling={gestureHandling as any}
      >
        <MapBridge onReady={onReady}>{children}</MapBridge>
      </Map>
    </div>
  );
};

export default GoogleMapContainer;