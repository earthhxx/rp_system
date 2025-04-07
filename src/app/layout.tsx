import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "./components/MenuToggle";
import { Roboto, Kanit } from 'next/font/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-roboto',
  })
  
  const kanit = Kanit({
    subsets: ['thai'],
    weight: ['600'],
    variable: '--font-kanit',
  })

export const metadata: Metadata = {
  title: "Reflow Profile System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className={`${roboto.variable} ${kanit.variable}`}>
        <Menu />
        <main>{children}</main>
      </body>
    </html>
  );
}

