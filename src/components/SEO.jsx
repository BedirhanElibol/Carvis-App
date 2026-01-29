import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | Carvis` : 'Carvis - Oto Servis Asistanı'}</title>
            <meta name="description" content={description || "Carvis ile aracınızın bakımını yapay zeka ile yönetin. En iyi ustaları bulun, parça sipariş edin."} />

            {/* Facebook tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title ? `${title} | Carvis` : 'Carvis'} />
            <meta property="og:description" content={description || "Carvis - Oto Servis Asistanınız"} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content="@carvisapp" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title ? `${title} | Carvis` : 'Carvis'} />
            <meta name="twitter:description" content={description || "Carvis - Oto Servis Asistanınız"} />
        </Helmet>
    );
};

export default SEO;
