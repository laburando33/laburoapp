import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Metadata } from "next";
import { Providers } from "./providers";
import OneSignalInit from "../components/OneSignalInit";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast"; // ✅ Agregamos Toaster

export const metadata: Metadata = {
  title: "Laburando App",
  description: "Conectamos personas con profesionales del hogar",
  icons: {
    icon: "/bd1b3bf5-5842-449a-a3eb-c22346ed02dc.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="es">
      <head>
        {/* Pixel de Meta */}
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

        {/* Google Search Console */}
        <meta
          name="google-site-verification"
          content="EgnbPWkr99s4ZQ4AtlzTVfsp0tEPQPozFo09sFFjBoY"
        />
      </head>
      <body className="layout">
        <Providers initialSession={session}>
          <OneSignalInit />
          <Header />
          <main className="main-content">{children}</main>
          <Footer />
          {/* ✅ Agregamos Toaster en todo el proyecto */}
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
