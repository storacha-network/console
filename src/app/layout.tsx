import SidebarLayout from '@/components/SidebarLayout'
import './globals.css'
import type { Metadata } from 'next'
import { H2 } from '@/components/Text'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'w3up console',
  description: 'web3.storage management console',
}

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-grad min-h-screen'>
        {children}
      </body>
    </html>
  )
}
