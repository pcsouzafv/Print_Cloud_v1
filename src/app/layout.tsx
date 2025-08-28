import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MSALProviderWrapper } from '@/providers/msal-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Print Cloud - Gestão de Impressoras',
  description: 'Sistema de gestão de impressoras e bilhetagem empresarial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <MSALProviderWrapper>
          {children}
        </MSALProviderWrapper>
      </body>
    </html>
  )
}