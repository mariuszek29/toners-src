import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taonerds.com'),
  title: 'TAO NERDS — Subnet Intelligence Terminal',
  description: 'Bloomberg Terminal for Bittensor subnets. Community-powered ratings, AMA archive, founder profiles, daily TAO signals.',
  openGraph: {
    title: 'TAO NERDS — Subnet Intelligence Terminal',
    description: 'Bloomberg Terminal for Bittensor subnets. Community-powered ratings, AMA archive, founder profiles, daily TAO signals.',
    url: 'https://taonerds.com',
    siteName: 'TAO NERDS',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@taonerds',
    creator: '@taonerds',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
