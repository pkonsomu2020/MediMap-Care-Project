import { InfoWindow } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

/**
 * PlaceOverviewInfoWindow
 * Attempts to render Google Maps Platform UI Kit "place overview" component (gmpx-place-overview).
 * If the gmpx component is unavailable in the current Maps JS build, it gracefully falls back
 * to the "gmp-place-details-compact" component.
 */
interface Props {
  placeId: string;
  position: { lat: number; lng: number };
  onCloseClick: () => void;
  widthPx?: number;
}

const FALLBACK_WIDTH = 380;

export default function PlaceOverviewInfoWindow({
  placeId,
  position,
  onCloseClick,
  widthPx = FALLBACK_WIDTH,
}: Props) {
  return (
    <InfoWindow position={position} onCloseClick={onCloseClick}>
      <div style={{ width: `${widthPx}px`, padding: "6px" }}>
        <PlaceOverviewOrFallback placeId={placeId} />
      </div>
    </InfoWindow>
  );
}

function PlaceOverviewOrFallback({ placeId }: { placeId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    // Prefer UI Kit "place overview" if available (gmpx-* web components)
    const hasGmpx = typeof (window as any).customElements?.get === "function" &&
      !!(window as any).customElements.get("gmpx-place-overview");

    if (hasGmpx) {
      // Build a place overview card similar to the example styling
      const overview = document.createElement("gmpx-place-overview");
      overview.setAttribute("style", "border-radius: 14px; overflow: hidden;");

      const placeReq = document.createElement("gmpx-place-overview-facade");
      // gmpx facade supports "place" attribute
      placeReq.setAttribute("place", placeId);

      // Content config for rating, media, type, open/now, accessible icon
      const content = document.createElement("gmpx-place-overview-content");
      content.innerHTML = `
        <gmpx-place-chip></gmpx-place-chip>
        <gmp-place-media lightbox-preferred></gmp-place-media>
        <gmp-place-rating></gmp-place-rating>
        <gmp-place-type></gmp-place-type>
        <gmp-place-open-now-status></gmp-place-open-now-status>
        <gmp-place-accessible-entrance-icon></gmp-place-accessible-entrance-icon>
      `;

      overview.appendChild(placeReq);
      overview.appendChild(content);
      el.appendChild(overview);
      return;
    }

    // Fallback to compact details (gmp-*)
    const compact = document.createElement("gmp-place-details-compact");
    compact.setAttribute("orientation", "horizontal");
    compact.setAttribute("truncation-preferred", "");

    const req = document.createElement("gmp-place-details-place-request");
    req.setAttribute("place", placeId);

    const cfg = document.createElement("gmp-place-content-config");
    cfg.innerHTML = `
      <gmp-place-media lightbox-preferred></gmp-place-media>
      <gmp-place-rating></gmp-place-rating>
      <gmp-place-type></gmp-place-type>
      <gmp-place-price></gmp-place-price>
      <gmp-place-accessible-entrance-icon></gmp-place-accessible-entrance-icon>
      <gmp-place-open-now-status></gmp-place-open-now-status>
    `;

    compact.appendChild(req);
    compact.appendChild(cfg);
    el.appendChild(compact);
  }, [placeId]);

  return <div ref={ref} />;
}