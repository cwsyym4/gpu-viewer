import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Viewer — H100 / B200 / Blackwell',
  description: 'Interactive H100 / B200 / Blackwell architecture — procedural Three.js, no GLBs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d180a] text-[#7fee64] font-mono antialiased">{children}</body>
    </html>
  )
}
