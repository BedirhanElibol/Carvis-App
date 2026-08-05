import React from "react";
import { Helmet } from "react-helmet-async";
const SEO = ({ title, description, type }) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>
        {title ? `${title} | Rapidsy` : "Rapidsy - Oto Servis Asistanı"}
      </title>
      <meta
        name="description"
        content={
          description ||
          "Rapidsy ile aracınızın bakımını yapay zeka ile yönetin. En iyi ustaları bulun, parça sipariş edin."
        }
      />
      {/* Facebook tags */}
      <meta property="og:type" content={type || "website"} />
      <meta
        property="og:title"
        content={title ? `${title} | Rapidsy` : "Rapidsy"}
      />
      <meta
        property="og:description"
        content={description || "Rapidsy - Oto Servis Asistanınız"}
      />
      {/* Twitter tags */}
      <meta name="twitter:creator" content="@rapidsyapp" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content={title ? `${title} | Rapidsy` : "Rapidsy"}
      />
      <meta
        name="twitter:description"
        content={description || "Rapidsy - Oto Servis Asistanınız"}
      />

      {/* Schema.org Structured Data (JSON-LD) for Search Engine Optimization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoRepair",
          "name": "Rapidsy",
          "url": "https://rapidsy.app/",
          "logo": "https://rapidsy.app/pwa-icon.png",
          "description": description || "Türkiye'nin akıllı otomobil platformu. Yapay zeka destekli araç bakımı, usta randevusu ve yedek parça pazaryeri.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "TR",
            "addressLocality": "İstanbul"
          },
          "openingHours": "Mo-Su 00:00-23:59",
          "priceRange": "₺₺"
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
