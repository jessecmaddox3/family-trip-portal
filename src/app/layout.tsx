import type { Metadata } from "next";
import localFont from "next/font/local";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getPortalConfig, getAvailableYears } from "@/lib/content";
import "./globals.css";
const heading = localFont({
  src: "./fonts/plus-jakarta-sans.ttf",
  variable: "--font-jakarta",
  display: "swap",
  weight: "200 800",
});
const body = localFont({
  src: "./fonts/inter.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
export async function generateMetadata(): Promise<Metadata> {
  const c = await getPortalConfig();
  return { title: c.title, description: c.description };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, years] = await Promise.all([
    getPortalConfig(),
    getAvailableYears(),
  ]);
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-sand-50 text-drift-500 font-body min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navigation config={config} years={years} />
        {config.demo && (
          <div className="demo-banner">
            Fictional demo. Every person, place, trip and tide is invented.{" "}
            <a href="https://github.com/jessecmaddox3/family-trip-portal">
              Make it yours
            </a>
          </div>
        )}
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer config={config} />
      </body>
    </html>
  );
}
