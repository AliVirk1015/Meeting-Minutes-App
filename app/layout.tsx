import { Geist, Geist_Mono, Noto_Serif } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import Navbar from "@/components/Navbar"
import { Metadata } from "next"

const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" })

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "MeetingMind - AI Meeting Notes for Productive Teams",
  description:
    "MeetingMind is an AI-powered meeting assistant that automatically generates accurate, actionable summaries of your meetings. Stay organized, aligned, and never miss a follow-up again.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-serif",
        notoSerif.variable
      )}
    >
      <body className="bg-accent">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
