import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { ManualLocationInput } from './useLocation.js';

export interface ManualLocationFormProps {
  onSubmit: (input: ManualLocationInput) => void;
}

export function ManualLocationForm({ onSubmit }: ManualLocationFormProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [label, setLabel] = useState('');
  const latitudeId = useId();
  const longitudeId = useId();
  const labelId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      latitude: Number(latitude),
      longitude: Number(longitude),
      label: label.trim() ? label.trim() : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="manual-location-form" noValidate>
      <div className="form-field">
        <label htmlFor={latitudeId}>Latitude</label>
        <input
          id={latitudeId}
          type="number"
          inputMode="decimal"
          step="any"
          min={-90}
          max={90}
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={longitudeId}>Longitude</label>
        <input
          id={longitudeId}
          type="number"
          inputMode="decimal"
          step="any"
          min={-180}
          max={180}
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={labelId}>Label (optional)</label>
        <input
          id={labelId}
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Home"
        />
      </div>
      <button type="submit">Use this location</button>
    </form>
  );
}
