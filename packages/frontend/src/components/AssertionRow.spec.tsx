import { fireEvent, render, screen } from '@testing-library/react';
import { AssertionRow } from './AssertionRow';
import type { Assertion } from './AssertionsSection';

// Mock the registry
jest.mock('@prompt-kitchen/shared/src/evaluation/matcher', () => ({
  registry: {
    toEqual: { arity: 'one' },
    toBeNull: { arity: 'none' },
    toMatch: { arity: 'one' },
  },
}));

describe('AssertionRow', () => {
  const assertion: Assertion = {
    id: '1',
    assertionId: 'a1',
    path: '$.name',
    matcher: 'toEqual',
    expected: 'test',
  };

  it('renders the assertion details', () => {
    render(
      <AssertionRow
        assertion={assertion}
        onChange={() => {}}
        onRemove={() => {}}
        onSelect={() => {}}
        isSelected={false}
      />
    );

    expect(screen.getByDisplayValue('$.name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('toEqual')).toBeInTheDocument();
  });

  it('calls onChange when the path is changed', () => {
    const handleChange = jest.fn();
    render(
      <AssertionRow
        assertion={assertion}
        onChange={handleChange}
        onRemove={() => {}}
        onSelect={() => {}}
        isSelected={false}
      />
    );

    const pathInput = screen.getByDisplayValue('$.name');
    fireEvent.change(pathInput, { target: { value: '$.newName' } });

    expect(handleChange).toHaveBeenCalledWith({ ...assertion, path: '$.newName' });
  });

  it('calls onRemove when the remove button is clicked', () => {
    const handleRemove = jest.fn();
    render(
      <AssertionRow
        assertion={assertion}
        onChange={() => {}}
        onRemove={handleRemove}
        onSelect={() => {}}
        isSelected={false}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(handleRemove).toHaveBeenCalledWith('1');
  });

  it('calls onSelect when the row is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <AssertionRow
        assertion={assertion}
        onChange={() => {}}
        onRemove={() => {}}
        onSelect={handleSelect}
        isSelected={false}
      />
    );

    const row = screen.getByRole('listitem');
    fireEvent.click(row);

    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
