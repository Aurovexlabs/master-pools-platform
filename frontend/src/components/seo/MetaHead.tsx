/**
 * Dynamic Meta Tags Component
 * Updates document head with proper meta tags for SEO
 */

import { useEffect } from "react";

interface MetaHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  siteName?: string;
  twitterCard?: string;
  twitterSite?: string;
  themeColor?: string;
  noindex?: boolean;
}

export function MetaHead({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  siteName = "MasterPools",
  twitterCard = "summary_large_image",
  twitterSite = "@masterspools",
  themeColor = "#0284c7",
  noindex = false,
}: MetaHeadProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
      updateMetaTag("og:title", ogTitle || title);
      updateMetaTag("twitter:title", ogTitle || title);
    }

    if (description) {
      updateMetaTag("description", description);
      updateMetaTag("og:description", ogDescription || description);
      updateMetaTag("twitter:description", ogDescription || description);
    }

    updateMetaTag("og:type", ogType);
    updateMetaTag("og:site_name", siteName);
    updateMetaTag("og:url", canonical || window.location.href);
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:url", canonical || window.location.href);
    updateMetaTag("twitter:site", twitterSite);
    updateMetaTag("twitter:creator", twitterSite);
    updateMetaTag("application-name", siteName);
    updateMetaTag("apple-mobile-web-app-title", siteName);
    updateMetaTag("theme-color", themeColor);

    if (ogImage) {
      updateMetaTag("og:image", ogImage);
      updateMetaTag("twitter:image", ogImage);
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
    }

    if (canonical) {
      updateCanonical(canonical);
    } else {
      updateCanonical(window.location.href);
    }

    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      removeMetaTag("robots");
    }
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    siteName,
    twitterCard,
    twitterSite,
    themeColor,
    noindex,
  ]);

  return null;
}

function updateMetaTag(name: string, content: string) {
  let tag = document.querySelector(
    `meta[name="${name}"], meta[property="${name}"]`,
  );

  if (!tag) {
    tag = document.createElement("meta");
    if (name.startsWith("og:")) {
      tag.setAttribute("property", name);
    } else {
      tag.setAttribute("name", name);
    }
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function removeMetaTag(name: string) {
  const tag = document.querySelector(
    `meta[name="${name}"], meta[property="${name}"]`,
  );
  if (tag) {
    tag.remove();
  }
}

function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}
