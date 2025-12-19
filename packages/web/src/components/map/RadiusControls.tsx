import React from 'react';
import { Button } from '@/components/ui/button';

export type RadiusMode = 'preset' | 'drag';

export interface RadiusControlsProps {
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  radiusMode: RadiusMode;
  setRadiusMode: (mode: RadiusMode) => void;
  disabled?: boolean;
  className?: string;
}

const PRESETS = [1, 3, 5, 10];

export const RadiusControls: React.FC<RadiusControlsProps> = ({
  radiusKm,
  setRadiusKm,
  radiusMode,
  setRadiusMode,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`} role="group" aria-label="Radius controls">
      {/* Preset radius buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((km) => {
          const active = radiusMode === 'preset' && radiusKm === km;
          return (
            <Button
              key={km}
              type="button"
              variant={active ? 'default' : 'outline'}
              size="sm"
              aria-pressed={active}
              aria-label={`${km} kilometers`}
              disabled={disabled}
              className="w-full"
              onClick={() => {
                setRadiusMode('preset');
                setRadiusKm(km);
              }}
            >
              {km} km
            </Button>
          );
        })}
      </div>

      {/* Drag mode toggle */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant={radiusMode === 'drag' ? 'default' : 'outline'}
          size="sm"
          aria-pressed={radiusMode === 'drag'}
          aria-label="Enable drag radius mode"
          disabled={disabled}
          className="w-full max-w-[120px]"
          onClick={() => setRadiusMode(radiusMode === 'drag' ? 'preset' : 'drag')}
        >
          {radiusMode === 'drag' ? '🎯 Drag: On' : '🎯 Drag: Off'}
        </Button>
      </div>
    </div>
  );
};

export default RadiusControls;