import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atolye Beyni",
  description: "Takim belgeleri, rapor hafizasi ve kaynakli taslak uretimi icin yerel atölye sistemi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
