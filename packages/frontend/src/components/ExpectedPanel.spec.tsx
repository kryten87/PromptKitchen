import { render, screen } from '@testing-library/react';
import { ExpectedPanel } from './ExpectedPanel';

describe('ExpectedPanel', () => {
  it('should render nothing for matchers with arity "none"', () => {
    render(<ExpectedPanel matcher="toBeNull" expected={null} onChange={() => {}} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render a textarea for "toEqual"', () => {
    render(<ExpectedPanel matcher="toEqual" expected={{ key: 'value' }} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter JSON or text')).toBeInTheDocument();
  });

  it('should render a textarea for "toBeOneOf" with specific placeholder', () => {
    render(<ExpectedPanel matcher="toBeOneOf" expected={['a', 'b']} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter JSON array of options')).toBeInTheDocument();
  });

  it('should render a regex input for "toMatch"', () => {
    render(<ExpectedPanel matcher="toMatch" expected="/pattern/i" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter pattern')).toBeInTheDocument();
    expect(screen.getByLabelText('i')).toBeInTheDocument();
  });
});
