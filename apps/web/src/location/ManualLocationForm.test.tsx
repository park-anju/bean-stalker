import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ManualLocationForm } from './ManualLocationForm.js';

describe('ManualLocationForm', () => {
  it('labels every field and submits parsed coordinates', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ManualLocationForm onSubmit={onSubmit} />);

    // Each control has a real, programmatically associated label.
    await user.type(screen.getByLabelText('Latitude'), '1.55');
    await user.type(screen.getByLabelText('Longitude'), '110.36');
    await user.type(screen.getByLabelText('Label (optional)'), 'Home');
    await user.click(screen.getByRole('button', { name: 'Use this location' }));

    expect(onSubmit).toHaveBeenCalledWith({ latitude: 1.55, longitude: 110.36, label: 'Home' });
  });

  it('leaves the coordinate fields unmarked when the last submission was valid', () => {
    render(<ManualLocationForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Latitude')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Longitude')).not.toHaveAttribute('aria-describedby');
  });

  it('marks both coordinate fields invalid and points them at the error message when told to', () => {
    render(<ManualLocationForm onSubmit={vi.fn()} invalid errorMessageId="loc-error" />);

    for (const name of ['Latitude', 'Longitude']) {
      const field = screen.getByLabelText(name);
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAttribute('aria-describedby', 'loc-error');
    }
  });
});
