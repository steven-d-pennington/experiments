import { createGlobalStyle, DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      error: string;
    };
    isDark: boolean;
  }
}

const GlobalStyles = createGlobalStyle`
  :root {
    --color-primary: ${({ theme }) => theme.colors.primary};
    --color-secondary: ${({ theme }) => theme.colors.secondary};
    --color-accent: ${({ theme }) => theme.colors.accent};
    --color-background: ${({ theme }) => theme.colors.background};
    --color-surface: ${({ theme }) => theme.colors.surface};
    --color-text: ${({ theme }) => theme.colors.text};
    --color-text-secondary: ${({ theme }) => theme.colors.textSecondary};
    --color-error: ${({ theme }) => theme.colors.error};
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: var(--color-background);
    color: var(--color-text);
    transition: background 0.3s, color 0.3s;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  code, pre {
    font-family: 'JetBrains Mono', monospace;
  }

  a {
    color: var(--color-accent);
    text-decoration: none;
    transition: color 0.2s;
  }

  a:hover {
    color: var(--color-secondary);
  }

  * {
    box-sizing: border-box;
  }
`;

export default GlobalStyles; 