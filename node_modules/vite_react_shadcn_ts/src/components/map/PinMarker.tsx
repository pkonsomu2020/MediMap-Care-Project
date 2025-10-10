import React from 'react';

export interface PinMarkerProps {
  color?: string;           // fill color of the pin
  size?: number;            // overall size (height in px)
  selected?: boolean;       // slightly larger + shadow on select
  label?: string;           // optional single-letter/short label
  className?: string;
}

/**
 * SVG pin inspired by Google-style teardrop marker, optimized for visibility.
 * Renders well inside <AdvancedMarker> as its child.
 */
const PinMarker: React.FC<PinMarkerProps> = ({
  color = '#10B981', // emerald
  size = 28,
  selected = false,
  label,
  className = '',
}) => {
  const h = size;
  const w = Math.round(size * 0.72); // pin is narrower than tall
  const scale = selected ? 1.12 : 1;
  const dropShadow = selected ? '0 4px 10px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.3)';

  // Path draws a teardrop shape with a circular head
  // Stroke is white for contrast over any basemap
  return (
    <div
      className={className}
      style={{
        transform: `translateY(${selected ? '-1px' : '0'}) scale(${scale})`,
        filter: 'saturate(1.05)',
      }}
      aria-hidden={label ? undefined : true}
      title={label}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', filter: `drop-shadow(${dropShadow})` }}
      >
        {/* Outer pin */}
        <path
          d="M12 31c0 0 9-11 9-18C21 5.925 16.075 1 12 1S3 5.925 3 13c0 7 9 18 9 18z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner circle */}
        <circle cx="12" cy="13" r="4.5" fill="#ffffff" fillOpacity="0.95" />
        {label ? (
          <text
            x="12"
            y="14.5"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill="#111827"
          >
            {label.slice(0, 2).toUpperCase()}
          </text>
        ) : null}
      </svg>
    </div>
  );
};

export default PinMarker;