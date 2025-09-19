// Alternative font configuration if Google Fonts continues to fail
import localFont from 'next/font/local';

// You can download Geist fonts locally and use them instead
export const geistSans = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-sans',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  display: 'swap',
});

export const geistMono = localFont({
  src: [
    {
      path: './fonts/GeistMonoVF.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
  fallback: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', 'monospace'],
  display: 'swap',
});