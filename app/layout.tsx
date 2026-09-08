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
  title: 'Drift & Dapple — A Cozy Aquarium Game',
  description: 'Swim gently, care for a living reef, and make friends with the fish.',
  openGraph: {
    title: 'Drift & Dapple',
    description: 'A cozy aquarium care game where you swim alongside friendly fish.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Drift & Dapple',
    description: 'A cozy aquarium care game where you swim alongside friendly fish.',
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
