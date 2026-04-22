import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SiteScore — Local SEO Audit Tool',
  description: 'Free local SEO audit for any US city. Get your score and fix list in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
