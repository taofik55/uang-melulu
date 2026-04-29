import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/shared/ThemeProvider"
import { Toaster } from "@/components/shared/Toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Uang Melulu",
    template: "%s — Uang Melulu",
  },
  description: "Aplikasi keuangan pribadi untuk catat pemasukan dan pengeluaran.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

