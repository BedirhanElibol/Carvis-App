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
    </Helmet>
  );
};

export default SEO;
