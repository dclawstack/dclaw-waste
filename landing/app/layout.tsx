import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DClaw Waste — AI-Powered Waste Management Platform",
  description:
    "Replace spreadsheets with an intelligent platform for equipment leasing, waste tracking, carbon reporting, and ESG compliance. Built for commercial waste management companies.",
  keywords: "waste management software, ESG reporting, carbon tracking, equipment leasing, waste SaaS",
  openGraph: {
    title: "DClaw Waste — AI-Powered Waste Management Platform",
    description: "From lease contracts to ESG reports — one platform for the entire waste management lifecycle.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
