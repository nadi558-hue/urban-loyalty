import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Urban Studio Club',
    short_name: 'Urban Club',
    description: 'מועדון הלקוחות של Urban Studio — צבירת Urban Coins, הטבות וצ׳ק-אין',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#3B2E27',
    theme_color: '#3B2E27',
    lang: 'he',
    dir: 'rtl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
