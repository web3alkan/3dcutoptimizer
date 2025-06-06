import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Sünger Kesim Optimizasyonu - FoamCut Pro',
  description: 'Gelişmiş AI algoritmalarıyla sünger kesim optimizasyonu. Minimum israf, maksimum verimlilik.',
  keywords: 'sünger kesim, optimizasyon, foam cutting, AI, 3D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
