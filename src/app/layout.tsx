import type { Metadata } from "next";
import { Black_Ops_One, Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/web3/Web3Provider";
import { AuthProvider } from "@/contexts/AuthContext";

const blackOpsOne = Black_Ops_One({
  weight: "400",
  variable: "--font-tanker",
  subsets: ["latin"],
});

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
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${blackOpsOne.variable} antialiased`}>
        <Web3Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
