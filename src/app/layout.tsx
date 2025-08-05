import type { Metadata } from "next";
import "./globals.css";
import Menu from "./components/MenuToggle";
import { Kanit} from "next/font/google";
import ReportIssueCard from "./components/ReportIssueCard";

const kanitFont = Kanit({
  subsets: ['thai'],
  weight: ["400", "700"],
  variable: "--font-kanit",
});



export const metadata: Metadata = {
  title: "Reflow Profile System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" />
      <head>

      </head>
      <body className={`${kanitFont.variable}`}>
        {/* Floating Report Issue Card */}
        <div className="fixed z-50">
          <ReportIssueCard />
        </div>
        <Menu />
        <main>{children}</main>
      </body>
    </html>
  );
}
