import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { MobileRibbon } from "@/components/layout/MobileRibbon";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Pond Vibe - Verified Reviews from the Plague Community",
  description: "Share and discover reviews from verified Plague and Exodus Plague NFT holders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <MobileRibbon />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
