import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
    canonical?: string;
    schema?: any;
}

const SEO: React.FC<SEOProps> = ({ 
    title, 
    description, 
    keywords, 
    image, 
    type = 'website', 
    canonical,
    schema 
}) => {
    const location = useLocation();
    const siteName = "Talentron";
    const fullTitle = `${title} | ${siteName}`;
    const defaultDescription = "Talentron is the ultimate college cultural fest. Join us for an unforgettable experience of music, dance, arts, and more.";
    const metaDescription = description || defaultDescription;
    const currentUrl = `https://shravan4507.github.io/website-talentron${location.pathname}`;
    const ogImage = image || "https://shravan4507.github.io/website-talentron/assets/og-image.webp";

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Update Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', metaDescription);
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            metaDesc.setAttribute('content', metaDescription);
            document.head.appendChild(metaDesc);
        }

        // Update Open Graph Tags
        const ogTags = {
            'og:title': fullTitle,
            'og:description': metaDescription,
            'og:url': currentUrl,
            'og:type': type,
            'og:image': ogImage,
            'og:site_name': siteName
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (tag) {
                tag.setAttribute('content', content);
            } else {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                tag.setAttribute('content', content);
                document.head.appendChild(tag);
            }
        });

        // Update Twitter Tags
        const twitterTags = {
            'twitter:title': fullTitle,
            'twitter:description': metaDescription,
            'twitter:image': ogImage,
            'twitter:card': 'summary_large_image'
        };

        Object.entries(twitterTags).forEach(([name, content]) => {
            let tag = document.querySelector(`meta[name="${name}"]`);
            if (tag) {
                tag.setAttribute('content', content);
            } else {
                tag = document.createElement('meta');
                tag.setAttribute('name', name);
                tag.setAttribute('content', content);
                document.head.appendChild(tag);
            }
        });

        // Update Keywords
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords);
            } else {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                metaKeywords.setAttribute('content', keywords);
                document.head.appendChild(metaKeywords);
            }
        }

        // Update Canonical Link
        const canonicalUrl = canonical || currentUrl;
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (linkCanonical) {
            linkCanonical.setAttribute('href', canonicalUrl);
        } else {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            linkCanonical.setAttribute('href', canonicalUrl);
            document.head.appendChild(linkCanonical);
        }

        // Handle Schema (JSON-LD)
        if (schema) {
            const scriptId = 'aeo-schema-jsonld';
            let script = document.getElementById(scriptId) as HTMLScriptElement;
            if (script) {
                script.text = JSON.stringify(schema);
            } else {
                script = document.createElement('script');
                script.id = scriptId;
                script.type = 'application/ld+json';
                script.text = JSON.stringify(schema);
                document.head.appendChild(script);
            }
        }

        return () => {
            // Cleanup schema on unmount if needed
            const script = document.getElementById('aeo-schema-jsonld');
            if (script) {
                // We keep it or clear it? Better to update it on next mount.
            }
        };
    }, [fullTitle, metaDescription, currentUrl, type, ogImage, keywords, canonical, schema]);

    return null; // This component doesn't render anything visually
};

export default SEO;
