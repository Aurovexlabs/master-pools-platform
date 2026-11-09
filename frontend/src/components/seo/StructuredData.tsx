/**
 * Structured Data Components for SEO
 * Renders JSON-LD schema markup in document head
 */

interface SchemaProps {
  schema: Record<string, any>;
}

export function StructuredData({ schema }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "MasterPools",
  url: "https://www.masterspools.co.zw",
  logo: "https://www.masterspools.co.zw/images/logo.jpeg",
  description:
    "Swimming pool construction, renovation, maintenance and equipment supply across Zimbabwe, run from Harare and Bulawayo. Trading since 2014.",
  foundingDate: "2014",
  telephone: "+263772562125",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Harare",
    addressCountry: "ZW",
    addressRegion: "Harare Province",
  },
  sameAs: [
    "https://www.facebook.com/masterspools",
    "https://www.instagram.com/masterspools",
  ],
  areaServed: "ZW",
  priceRange: "$$$",
  image: "https://www.masterspools.co.zw/og-image.png",
};

export function organizationSchemaWithFAQ(
  faqItems: Array<{ question: string; answer: string }>,
) {
  return {
    ...organizationSchema,
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function projectSchema(project: {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image:
      project.image || "https://www.masterspools.co.zw/default-project.png",
    category: project.category,
    author: {
      "@type": "Organization",
      name: "MATERPOOLS AND CONTRUCTION",
    },
    ...(project.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: project.rating,
        reviewCount: project.reviewCount || 1,
      },
    }),
  };
}

export function reviewSchema(review: {
  title: string;
  author: string;
  rating: number;
  content: string;
  date?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: review.title,
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: review.content,
    ...(review.date && { datePublished: review.date }),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: post.url,
    image: post.image,
    author: {
      "@type": "Organization",
      name: post.author || "MATERPOOLS AND CONTRUCTION",
    },
    publisher: {
      "@type": "Organization",
      name: "MATERPOOLS AND CONTRUCTION",
      logo: {
        "@type": "ImageObject",
        url: "https://www.masterspools.co.zw/images/logo.jpeg",
      },
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
  };
}

export function blogCollectionSchema(
  items: Array<{
    title: string;
    url: string;
    image?: string;
    description?: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Updates",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.title,
      image: item.image,
      description: item.description,
    })),
  };
}
