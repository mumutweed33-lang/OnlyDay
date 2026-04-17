import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/providers/AppProviders'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'OnlyDay - A Plataforma Premium do Brasil',
  description: 'Rede social premium para criadores de conteudo. Monetize sua audiencia com exclusividade e elegancia.',
  keywords: 'criadores de conteudo, monetizacao, rede social premium, Brasil',
  authors: [{ name: 'OnlyDay' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/brand-logo.svg',
    shortcut: '/brand-logo.svg',
    apple: '/brand-logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7C3AED',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased bg-dark text-white`} suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
