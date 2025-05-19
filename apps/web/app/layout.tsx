// layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import OneSignalInit from "@/components/OneSignalInit";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Laburando App",
  description: "Conectamos personas con profesionales del hogar",
  icons: { icon: "/bd1b3bf5-5842-449a-a3eb-c22346ed02dc.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Conectamos personas con profesionales del hogar." />
        <meta name="author" content="Laburando App" />
        <meta name="keywords" content="servicios, profesionales, hogar, reparaciones, Laburando" />
        
        {/* ✅ Google Search Console */}
        <meta
          name="google-site-verification"
          content="EgnbPWkr99s4ZQ4AtlzTVfsp0tEPQPozFo09sFFjBoY"
        />

        {/* ✅ Pixel de Meta (Facebook) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}
              (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1588116741832247'); 
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1588116741832247&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
      </head>
      <body className="layout">
        <OneSignalInit /> {/* ✅ Inicialización Global */}
        <Providers initialSession={session}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
