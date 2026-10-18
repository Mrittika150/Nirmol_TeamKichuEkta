import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bengali = Noto_Sans_Bengali({ variable: "--font-bengali", subsets: ["bengali"] });

export const metadata: Metadata = {
  title: "Nirmol — নির্মল",
  description: "PM2.5 forecasts, personal exposure guidance and pollution reporting for Bangladesh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1416" },
  ],
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("nirmol.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply a saved theme before first paint; otherwise the system preference applies. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${bengali.variable} antialiased`}>
        <I18nProvider><AppShell>{children}</AppShell></I18nProvider>
      </body>
    </html>
  );
}
