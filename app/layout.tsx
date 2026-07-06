import type { Metadata, Viewport } from 'next'
import { Frank_Ruhl_Libre, Assistant } from 'next/font/google'
import './globals.css'

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
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} ${assistant.variable}`}>
      <body className="min-h-dvh" style={{ fontFamily: 'var(--font-assistant), Assistant, sans-serif' }}>{children}</body>
    </html>
  )
}
