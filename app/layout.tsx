import type { Metadata, Viewport } from 'next'
import { Frank_Ruhl_Libre, Assistant } from 'next/font/google'
import './globals.css'
import PwaInstall from '@/components/PwaInstall'

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-frank',
  display: 'swap',
})
const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-assistant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Urban Studio – מועדון לקוחות',
  description: 'צבור נקודות, עלה ברמה, קבל הטבות בלעדיות',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Urban Club',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3B2E27',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} ${assistant.variable}`}>
      <body className="min-h-dvh" style={{ fontFamily: 'var(--font-assistant), Assistant, sans-serif' }}>
        {children}
        <PwaInstall />
      </body>
    </html>
  )
}
