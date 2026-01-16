import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../theme';

describe('ThemeToggle', () => {
  it('renders and toggles theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    const initialText = btn.textContent;
    fireEvent.click(btn);
    expect(btn.textContent).not.toBe(initialText);
  });
});
