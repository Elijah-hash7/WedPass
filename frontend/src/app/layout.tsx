import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WedPass | Elegant Wedding Guest Management",
  description: "Premium ceremony verification and guest management system. Create events, share invite links, and manage guest check-ins with live dashboards.",
};

const themeInitScript = `
  (() => {
    try {
      const savedTheme = window.localStorage.getItem("wedpass-theme");
      const isDark = savedTheme === "dark";
      document.documentElement.classList.toggle("theme-dark", isDark);
    } catch {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${jost.variable}`}>
      <body className={cn(
        "min-h-screen font-sans antialiased text-[var(--color-ink-strong)] bg-[var(--color-shell)]"
      )}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AuthProvider>
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col relative bg-[var(--color-shell)] shadow-2xl overflow-x-hidden">
            <AppShell>{children}</AppShell>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
