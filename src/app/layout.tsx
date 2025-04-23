import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "./components/MenuToggle";
import {Kanit} from "next/font/google";

const kanitFont = Kanit({
    subsets:['thai'],
    weight: "400",
    variable:"--font-kanit",
})

export const metadata: Metadata = {
  title: "Reflow Profile System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className={`${kanitFont.variable} font-sans`}>
        <Menu />
        <main>{children}</main>
      </body>
    </html>
  );
}
