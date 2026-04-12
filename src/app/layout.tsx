import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shoqan Alumni",
  description: "A premium networking and portfolio platform for Shoqan alumni and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="font-sans bg-[#0a110e] text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
