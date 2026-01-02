import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // YOUR ORIGINAL IMPORT
import "./globals.css";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PawReader - Pet Thought Decoder",
  description: "AI-powered pet thought reader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (localStorage.getItem('pawreader_unlock_code')) {
                  document.documentElement.classList.add('unlocked');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
