import React from 'react';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-text);
`;

const Header = styled.header`
  width: 100%;
  padding: 1.5rem 2rem 1rem 2rem;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const SiteTitle = styled.a`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  text-decoration: none;
  letter-spacing: 0.02em;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 2rem 1rem;
  @media (max-width: 768px) {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 1rem 2rem;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 1rem;
  border-top: 1px solid var(--color-surface);
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Container>
    <Header>
      <SiteTitle href="/">🧪 Experiments Gallery</SiteTitle>
      <Nav>
        <ThemeToggle />
        <AuthButton />
      </Nav>
    </Header>
    <Main>{children}</Main>
    <Footer>
      &copy; {new Date().getFullYear()} Experiments Gallery &mdash; <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
    </Footer>
  </Container>
);

export default Layout; 