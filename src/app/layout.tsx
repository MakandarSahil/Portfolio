import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Sahil Makandar | Software Engineer",
  description:
    "Portfolio of Sahil Makandar – Software Engineer passionate about web development, AI, and modern technologies.",
  icons: {
    icon: "/spiderman.png",
  },
  keywords: [
    "Sahil Makandar",
    "Software Engineer",
    "Web Developer",
    "React Developer",
    "Portfolio",
    "Next.js Portfolio",
    "Frontend Engineer",
    "Full Stack Developer",
  ],
  authors: [{ name: "Sahil Makandar", url: "https://yourdomain.com" }],
  creator: "Sahil Makandar",
  openGraph: {
    title: "Sahil Makandar | Software Engineer",
    description:
      "Explore Sahil's portfolio showcasing modern web development and projects.",
    url: "https://yourdomain.com",
    siteName: "Sahil Makandar Portfolio",
    images: [
      {
        url: "/spiderman.png",
        width: 1200,
        height: 630,
        alt: "Sahil Makandar Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahil Makandar | Software Engineer",
    description: "Explore Sahil's personal developer portfolio and projects.",
    creator: "@yourhandle",
    images: ["/spiderman.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
