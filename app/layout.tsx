import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WorkForce - Workforce Management System",
  description: "A comprehensive workforce management system",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <div className="w-full text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} <a href="https://www.dynamicstartup.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">dynamicstartup</a>. All rights reserved.
          </div>
        </main>
      </body>
    </html>
  )
}



import './globals.css'