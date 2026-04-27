import type { Metadata } from 'next'
import { Space_Grotesk, Inter, Caveat } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SiteScore — Local SEO Audit Tool',
  description: 'Free local SEO audit for small businesses in any US city. Get your score and a prioritized fix list in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
