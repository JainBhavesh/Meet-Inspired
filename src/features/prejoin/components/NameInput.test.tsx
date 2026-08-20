import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameInput } from './NameInput';

describe('NameInput', () => {
  it('does not show a validation error before the user interacts with it, even with an invalid value', () => {
    render(<NameInput value="A" onChange={vi.fn()} />);
    expect(screen.queryByText(/at least/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows a validation error only after the field is touched (blurred) with an invalid value', async () => {
    const user = userEvent.setup();
    render(<NameInput value="A" onChange={vi.fn()} />);

    const input = screen.getByLabelText('Your name');
    expect(screen.queryByText(/at least/i)).not.toBeInTheDocument();

    await user.click(input);
    await user.tab();

    expect(screen.getByText(/at least/i)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the error once the value becomes valid', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NameInput value="A" onChange={vi.fn()} />);

    const input = screen.getByLabelText('Your name');
    await user.click(input);
    await user.tab();
    expect(screen.getByText(/at least/i)).toBeInTheDocument();

    rerender(<NameInput value="Alice" onChange={vi.fn()} />);
    expect(screen.queryByText(/at least/i)).not.toBeInTheDocument();
  });

  it('calls onChange with the field value on every keystroke', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    // `value` stays fixed here (a controlled input with no feedback loop),
    // so each keystroke starts from "" again — this asserts the raw
    // per-keystroke callback contract, not accumulated typed text.
    render(<NameInput value="" onChange={handleChange} />);

    await user.type(screen.getByLabelText('Your name'), 'Bo');

    expect(handleChange).toHaveBeenNthCalledWith(1, 'B');
    expect(handleChange).toHaveBeenNthCalledWith(2, 'o');
  });

  it('enforces the maximum length via the input maxLength attribute', () => {
    render(<NameInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Your name')).toHaveAttribute('maxLength', '50');
  });
});
