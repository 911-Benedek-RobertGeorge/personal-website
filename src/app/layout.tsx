import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import CalendlyBadgeClient from "./components/CalendlyBadgeClient";

export const metadata: Metadata = {
  metadataBase: new URL('https://benedek-systems.vercel.app'),
  title: "BENEDEK.SYS · Integrare AI pentru afaceri",
  description: "Găsesc blocajul din afacerea ta și îl automatizez cu AI. Integrări AI construite de un developer, nu de un marketer.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "BENEDEK.SYS · Integrare AI pentru afaceri",
    description: "Găsesc blocajul din afacerea ta și îl automatizez cu AI. Integrări AI construite de un developer, nu de un marketer.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BENEDEK.SYS · Integrare AI pentru afaceri",
    description: "Găsesc blocajul din afacerea ta și îl automatizez cu AI. Integrări AI construite de un developer, nu de un marketer.",
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
        className="antialiased"
        suppressHydrationWarning={true}
      >
        {children}
        <Script id="calendly-external" src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
        <CalendlyBadgeClient />
      </body>
    </html>
  );
}
