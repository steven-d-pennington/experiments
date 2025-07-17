import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '../theme';
import GlobalStyles from '../styles/globalStyles';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
