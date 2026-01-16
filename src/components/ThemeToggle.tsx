import React from 'react';
import { useTheme } from '../theme';
import styled from 'styled-components';

const ToggleButton = styled.button`
  background: var(--color-surface);
  color: var(--color-text);
  border: none;
  border-radius: 999px;
  padding: 0.5em 1.2em;
  font-size: 1em;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    background 0.2s,
    color 0.2s;
  margin: 0.5em;
  &:hover {
    background: var(--color-accent);
    color: var(--color-background);
  }
`;

const ThemeToggle: React.FC = () => {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const currentIdx = availableThemes.findIndex((t) => t.id === currentTheme.id);
  const nextTheme = () => {
    const nextIdx = (currentIdx + 1) % availableThemes.length;
    setTheme(availableThemes[nextIdx].id);
  };
  return (
    <ToggleButton onClick={nextTheme} aria-label="Cycle theme">
      {currentTheme.isDark ? '🌙' : '☀️'} {currentTheme.name} (Next)
    </ToggleButton>
  );
};

export default ThemeToggle;
