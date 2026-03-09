import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import CalendlyBadgeClient from "./components/CalendlyBadgeClient";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://benedek-systems.vercel.app'),
  title: "BENEDEK.SYS",
  description: "Inginerie, nu gălăgie! Iți construiesc infrastructura digitală",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "BENEDEK.SYS",
    description: "Inginerie, nu gălăgie! Iți construiesc infrastructura digitală",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BENEDEK.SYS",
    description: "Inginerie, nu gălăgie! Iți construiesc infrastructura digitală",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <head>
        <link rel="icon" href="/logo.png" />
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
        />
        <meta name="theme-color" content="#000022" />
        <meta name="author" content="Benedek Systems" />
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            (function() {
              var pid = '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""}';
              if (!pid) return;
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', pid);
              fbq('track', 'PageView');
            })();
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Script id="calendly-external" src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
        <CalendlyBadgeClient />
      </body>
    </html>
  );
}
