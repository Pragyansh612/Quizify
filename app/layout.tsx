import "./globals.css";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap"
});

export const metadata = {
  title: "Quizify - Interactive Quiz App",
  description: "Test your knowledge with our interactive quiz app!",
  openGraph: {
    title: "Quizify - Interactive Quiz App",
    description: "Test your knowledge with our interactive quiz app!",
    type: "website"
  }
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        data-new-gr-c-s-check-loaded="14.1220.0"
        data-gr-ext-installed=""
      >
        {children}
      </body>
    </html>
  );
}
