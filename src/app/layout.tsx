import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "ASTRO — Streetwear Premium",
    template: "%s | ASTRO",
  },
  description:
    "ASTRO é uma marca de streetwear premium. Camisas oversized, bonés, cintos e anéis com identidade única.",
  keywords: ["streetwear", "moda urbana", "astro", "oversized", "premium"],
  authors: [{ name: "Astro Brand" }],
  creator: "Astro Brand",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://astrobrand.com",
    title: "ASTRO — Streetwear Premium",
    description:
      "ASTRO é uma marca de streetwear premium. Camisas oversized, bonés, cintos e anéis com identidade única.",
    siteName: "ASTRO",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTRO — Streetwear Premium",
    description:
      "ASTRO é uma marca de streetwear premium. Camisas oversized, bonés, cintos e anéis com identidade única.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
