import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should render a regex input for "toMatch" with string pattern', () => {
    render(<ExpectedPanel matcher="toMatch" expected="pattern" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter pattern')).toBeInTheDocument();
    expect(screen.getByTestId('regex-flag-i')).toBeInTheDocument();
    expect(screen.getByTestId('regex-flag-m')).toBeInTheDocument();
    expect(screen.getByTestId('regex-flag-s')).toBeInTheDocument();
    expect(screen.getByTestId('regex-flag-u')).toBeInTheDocument();
  });

  it('should render a regex input for "toMatch" with flags object', () => {
    const expected = { source: 'pattern', flags: 'i' };
    render(<ExpectedPanel matcher="toMatch" expected={expected} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter pattern')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pattern')).toBeInTheDocument();
    // Check that 'i' flag is selected
    expect(screen.getByTestId('regex-flag-i')).toBeChecked();
    expect(screen.getByTestId('regex-flag-m')).not.toBeChecked();
  });

  it('should call onChange with flags object when regex flags are selected', () => {
    const onChange = jest.fn();
    render(<ExpectedPanel matcher="toMatch" expected="pattern" onChange={onChange} />);
    
    // Click the 'i' flag checkbox
    fireEvent.click(screen.getByTestId('regex-flag-i'));
    
    expect(onChange).toHaveBeenCalledWith({ source: 'pattern', flags: 'i' });
  });

  it('should call onChange with string when no flags are selected', () => {
    const onChange = jest.fn();
    const expected = { source: 'pattern', flags: 'i' };
    render(<ExpectedPanel matcher="toMatch" expected={expected} onChange={onChange} />);
    
    // Uncheck the 'i' flag
    fireEvent.click(screen.getByTestId('regex-flag-i'));
    
    expect(onChange).toHaveBeenCalledWith('pattern');
  });

  it('should render a regex input for "toMatch" with flags object', () => {
    const expected = { source: 'pattern', flags: 'i' };
    render(<ExpectedPanel matcher="toMatch" expected={expected} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter pattern')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pattern')).toBeInTheDocument();
    // Check that 'i' flag is selected
    expect(screen.getByLabelText('i')).toBeChecked();
    expect(screen.getByLabelText('m')).not.toBeChecked();
  });

  it('should call onChange with flags object when regex flags are selected', () => {
    const onChange = jest.fn();
    render(<ExpectedPanel matcher="toMatch" expected="pattern" onChange={onChange} />);
    
    // Click the 'i' flag checkbox
    fireEvent.click(screen.getByLabelText('i'));
    
    expect(onChange).toHaveBeenCalledWith({ source: 'pattern', flags: 'i' });
  });

  it('should call onChange with string when no flags are selected', () => {
    const onChange = jest.fn();
    const expected = { source: 'pattern', flags: 'i' };
    render(<ExpectedPanel matcher="toMatch" expected={expected} onChange={onChange} />);
    
    // Uncheck the 'i' flag
    fireEvent.click(screen.getByLabelText('i'));
    
    expect(onChange).toHaveBeenCalledWith('pattern');
  });

  it('should call onChange with updated pattern and preserve flags', () => {
    const onChange = jest.fn();
    const expected = { source: 'pattern', flags: 'i' };
    render(<ExpectedPanel matcher="toMatch" expected={expected} onChange={onChange} />);
    
    // Change the pattern
    fireEvent.change(screen.getByPlaceholderText('Enter pattern'), {
      target: { value: 'newpattern' }
    });
    
    expect(onChange).toHaveBeenCalledWith({ source: 'newpattern', flags: 'i' });
  });
});
