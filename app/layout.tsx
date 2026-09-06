import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://drift-and-dapple.evanyz2010.chatgpt.site'),
  title: 'Drift & Dapple — A Cozy Aquarium Game',
  description: 'Swim gently, care for a living reef, and make friends with the fish.',
  openGraph: {
    title: 'Drift & Dapple',
    description: 'A cozy aquarium care game where you swim alongside friendly fish.',
    type: 'website',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Drift & Dapple cozy aquarium care game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drift & Dapple',
    description: 'A cozy aquarium care game where you swim alongside friendly fish.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
