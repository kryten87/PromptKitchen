/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders sidebar and main content', () => {
    render(
      <AppLayout sidebar={<div>Sidebar</div>}>
        <div>Main Content</div>
      </AppLayout>
    );
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });
});
