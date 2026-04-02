import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Bayo & Tolu Wedding | Guest Access",
  description: "Traditional Wedding Ceremony Guest Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen font-sans antialiased",
        manrope.variable,
        playfair.variable
      )}>
        {children}
      </body>
    </html>
  );
}
