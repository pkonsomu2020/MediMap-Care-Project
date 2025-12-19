import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';

type LatLng = { lat: number; lng: number };

export interface ClinicInfo {
  id: string | number;
  name: string;
  position: LatLng;
  placeId?: string;
  rating?: number;
  address?: string;
  durationText?: string;
  distanceText?: string;
  // Optional extras from backend/Supabase
  phone?: string | null;
  website?: string | null;
  is_open?: boolean | null;
  wheelchairAccessibleEntrance?: boolean | null;
  raw?: any;
}

export interface CustomInfoWindowProps {
  clinic: ClinicInfo;
  onClose: () => void;
  /**
   * Optional toggle that allows the parent to switch to the UI Kit compact view
   * (e.g., PlaceDetailsInfoWindow) when available.
   */
  onToggleCompact?: () => void;
}

/**
 * CustomInfoWindow
 * Rich, themed info window for clinic markers. Accepts normalized clinic data
 * and renders a compact summary + quick actions. Designed to be used alongside
 * a UI-kit variant that lazily fetches additional details by placeId.
 */
export const CustomInfoWindow: React.FC<CustomInfoWindowProps> = ({
  clinic,
  onClose,
  onToggleCompact,
}) => {
  const rating = typeof clinic.rating === 'number' ? clinic.rating : undefined;
  const wheelchair =
    typeof clinic.wheelchairAccessibleEntrance === 'boolean'
      ? clinic.wheelchairAccessibleEntrance
      : (clinic.raw?.wheelchairAccessibleEntrance as boolean | undefined);

  return (
    <InfoWindow position={clinic.position} onCloseClick={onClose}>
      <div
        role="dialog"
        aria-label={`${clinic.name} details`}
        className="w-[360px] md:w-[380px] overflow-hidden rounded-xl shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, rgba(45,154,122,1) 0%, rgba(52,211,153,1) 100%)',
          color: 'white',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="font-semibold text-base leading-5 truncate">{clinic.name}</div>
            {clinic.address ? (
              <div className="text-xs opacity-90 truncate">{clinic.address}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {/* Compact view toggle (UI Kit) */}
            {clinic.placeId && onToggleCompact ? (
              <button
                onClick={onToggleCompact}
                className="text-white/90 hover:text-white text-xs px-2 py-1 rounded-md border border-white/30"
                aria-label="View compact place details"
                title="View compact place details"
              >
                Compact
              </button>
            ) : null}
            <button
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="text-white/90 hover:text-white"
            >
              {/* X icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-3">
            {/* Thumbnail placeholder */}
            <div
              className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" className="text-white/90" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-3a3 3 0 0 1-3-3v-4a1 1 0 0 0-1-1H8a4 4 0 0 0-4 4" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              {/* Rating line */}
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1">
                  <span className="sr-only">Rating</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" className="text-yellow-300" fill="currentColor" aria-hidden="true">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.896 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
                  </svg>
                  <strong>{typeof rating === 'number' ? rating.toFixed(1) : '—'}</strong>
                </span>

                {/* Open now */}
                {typeof clinic.is_open === 'boolean' ? (
                  <span className="text-white/90 text-xs ml-2">
                    {clinic.is_open ? 'Open now' : 'Closed'}
                  </span>
                ) : null}

                {/* Wheelchair accessible */}
                {wheelchair ? (
                  <span className="text-white/90 text-xs ml-2" title="Wheelchair accessible" aria-label="Wheelchair accessible">
                    ♿
                  </span>
                ) : null}
              </div>

              {/* Distance / Duration */}
              {(clinic.distanceText || clinic.durationText) ? (
                <div className="text-xs text-white/90 mt-1">
                  {clinic.distanceText ? clinic.distanceText : '--'}
                  {' • '}
                  {clinic.durationText ? clinic.durationText : '--'}
                </div>
              ) : null}

              {/* Phone / Website */}
              <div className="flex flex-wrap gap-2 mt-2">
                {clinic.phone ? (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="text-white/95 hover:underline text-xs"
                    aria-label="Call clinic"
                    title="Call clinic"
                  >
                    Call
                  </a>
                ) : null}
                {clinic.website ? (
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/95 hover:underline text-xs"
                    aria-label="Visit website"
                    title="Visit website"
                  >
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 text-[11px] text-white/85">
            Data sources: Google Places & Supabase
          </div>
        </div>
      </div>
    </InfoWindow>
  );
};

export default CustomInfoWindow;