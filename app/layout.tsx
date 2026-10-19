import type { Metadata } from "next";
import { DM_Sans, Fraunces, Pinyon_Script } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const pinyon = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export const metadata: Metadata = {
  title: "read receipts — A book can say it for you",
  description: "Recommend a book. Dedicate one. Stay anonymous.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable} ${pinyon.variable}`}>
        {children}
      </body>
    </html>
  );
}
