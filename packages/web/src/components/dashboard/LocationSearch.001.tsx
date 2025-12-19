import { useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LocationSearchProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export const LocationSearch = ({ onPlaceSelect }: LocationSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    autocomplete.current = new places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ke' }, // Restrict to Kenya
      fields: ['geometry.location', 'name', 'formatted_address'],
    });

    const listener = autocomplete.current.addListener('place_changed', () => {
      const place = autocomplete.current?.getPlace();
      if (place) {
        onPlaceSelect(place);
      }
    });

    return () => {
      // Clean up the listener when the component unmounts
      if (google && google.maps && google.maps.event) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [places, onPlaceSelect]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        className="pl-10"
      />
    </div>
  );
};