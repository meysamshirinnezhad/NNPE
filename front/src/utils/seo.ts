
// SEO utility functions for dynamic meta tag management
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  schema?: object;
}

export const updateSEO = (seoData: SEOData) => {
  // Update title
  document.title = seoData.title;
  
  // Update meta description
  updateMetaTag('description', seoData.description);
  
  // Update keywords if provided
  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords);
  }
  
  // Update Open Graph tags
  updateMetaProperty('og:title', seoData.title);
  updateMetaProperty('og:description', seoData.description);
  updateMetaProperty('og:url', window.location.href);
  
  if (seoData.ogImage) {
    updateMetaProperty('og:image', seoData.ogImage);
  }
  
  // Update Twitter tags
  updateMetaProperty('twitter:title', seoData.title);
  updateMetaProperty('twitter:description', seoData.description);
  
  if (seoData.ogImage) {
    updateMetaProperty('twitter:image', seoData.ogImage);
  }
  
  // Update canonical URL
  if (seoData.canonical) {
    updateCanonical(seoData.canonical);
  }
  
  // Add Schema.org JSON-LD
  if (seoData.schema) {
    addSchemaMarkup(seoData.schema);
  }
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateCanonical = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};

const addSchemaMarkup = (schema: object) => {
  // Remove existing schema
  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }
  
  // Add new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// Predefined SEO data for different pages
export const seoData = {
  landing: {
    title: 'NPPE Pro - Professional Engineering Exam Preparation Platform',
    description: 'Pass your NPPE exam with confidence. Comprehensive study materials, practice tests, and analytics for professional engineers. 95% pass rate, 500+ questions.',
    keywords: 'NPPE exam, professional engineering, exam preparation, practice tests, engineering certification, professional engineer',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "NPPE Pro",
      "description": "Professional Engineering Exam Preparation Platform",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "NPPE Pro",
        "logo": {
          "@type": "ImageObject",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/logo.png`
        }
      }
    }
  },
  dashboard: {
    title: 'Dashboard - NPPE Pro',
    description: 'Track your NPPE exam preparation progress with detailed analytics, performance metrics, and personalized study recommendations.',
    keywords: 'NPPE dashboard, exam progress, study analytics, performance tracking',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/dashboard`,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "NPPE Pro Dashboard",
      "description": "Professional Engineering Exam Preparation Dashboard",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/dashboard`,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  home: {
    title: 'Home - NPPE Pro',
    description: 'Welcome to NPPE Pro - Your comprehensive platform for professional engineering exam preparation.',
    keywords: 'NPPE home, engineering exam, professional certification',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/home`
  },
  about: {
    title: 'About Us - NPPE Pro | Leading NPPE Exam Preparation Platform',
    description: 'Learn about NPPE Pro\'s mission to help engineers pass the National Professional Practice Examination. Founded by engineers, for engineers.',
    keywords: 'NPPE Pro team, engineering exam preparation, professional engineers, company mission, engineering education',
    ogTitle: 'About NPPE Pro - Empowering Engineers to Achieve Excellence',
    ogDescription: 'Founded by engineers, for engineers. Discover how NPPE Pro has helped over 10,000 engineers achieve their P.Eng designation.',
    ogImage: 'https://readdy.ai/api/search-image?query=professional%20engineering%20team%20collaboration%20office%20environment&width=1200&height=630&seq=about-og&orientation=landscape',
    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About NPPE Pro",
      "description": "Learn about NPPE Pro's mission to help engineers pass the National Professional Practice Examination",
      "url": `${import.meta.env.VITE_SITE_URL}/about`,
      "mainEntity": {
        "@type": "Organization",
        "name": "NPPE Pro",
        "description": "Leading NPPE exam preparation platform for professional engineers",
        "foundingDate": "2020",
        "numberOfEmployees": "10-50",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "CA"
        }
      }
    }
  },
  features: {
    title: 'Features - NPPE Pro | Comprehensive NPPE Exam Preparation Tools',
    description: 'Discover NPPE Pro\'s powerful features: 500+ practice questions, realistic tests, advanced analytics, study paths, and mobile learning.',
    keywords: 'NPPE exam features, practice questions, study tools, engineering exam preparation, mobile learning, analytics',
    ogTitle: 'NPPE Pro Features - Everything You Need to Pass the NPPE',
    ogDescription: 'Comprehensive tools, expert content, and proven strategies designed specifically for Canadian engineering professionals.',
    ogImage: 'https://readdy.ai/api/search-image?query=modern%20engineering%20study%20workspace%20features&width=1200&height=630&seq=features-og&orientation=landscape',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "NPPE Pro Features",
      "description": "Comprehensive NPPE exam preparation tools and features",
      "url": `${import.meta.env.VITE_SITE_URL}/features`,
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "NPPE Pro",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "49",
          "priceCurrency": "CAD"
        }
      }
    }
  },
  pricing: {
    title: 'Pricing - NPPE Pro | Flexible Plans for NPPE Exam Success',
    description: 'Choose from Basic ($39/month), Professional ($79/month), or Premium ($159/month) plans. 14-day free trial included.',
    keywords: 'NPPE exam pricing, subscription plans, engineering exam costs, free trial, professional engineer preparation',
    ogTitle: 'NPPE Pro Pricing - Choose Your Path to Success',
    ogDescription: 'Flexible pricing plans designed to fit your study needs and budget. Start with a 14-day free trial.',
    ogImage: 'https://readdy.ai/api/search-image?query=pricing%20plans%20comparison%20professional&width=1200&height=630&seq=pricing-og&orientation=landscape',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "NPPE Pro Pricing",
      "description": "Flexible pricing plans for NPPE exam preparation",
      "url": `${import.meta.env.VITE_SITE_URL}/pricing`,
      "mainEntity": [
        {
          "@type": "Offer",
          "name": "Basic Plan",
          "price": "39",
          "priceCurrency": "CAD",
          "billingIncrement": "P1M"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan",
          "price": "79",
          "priceCurrency": "CAD",
          "billingIncrement": "P1M"
        },
        {
          "@type": "Offer",
          "name": "Premium Plan",
          "price": "159",
          "priceCurrency": "CAD",
          "billingIncrement": "P1M"
        }
      ]
    }
  },
  login: {
    title: 'Login - NPPE Pro | Access Your NPPE Exam Preparation',
    description: 'Sign in to your NPPE Pro account to continue your professional engineering exam preparation journey.',
    keywords: 'NPPE Pro login, sign in, engineering exam account, professional engineer preparation',
    ogTitle: 'Login to NPPE Pro',
    ogDescription: 'Access your personalized NPPE exam preparation dashboard and continue your journey to professional engineering success.',
    ogImage: 'https://readdy.ai/api/search-image?query=professional%20login%20interface%20engineering&width=1200&height=630&seq=login-og&orientation=landscape',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "NPPE Pro Login",
      "description": "Sign in to access your NPPE exam preparation account",
      "url": `${import.meta.env.VITE_SITE_URL}/login`
    }
  },
  signup: {
    title: 'Sign Up - NPPE Pro | Start Your NPPE Exam Preparation',
    description: 'Create your NPPE Pro account and start your journey to professional engineering success. 14-day free trial included.',
    keywords: 'NPPE Pro signup, create account, engineering exam registration, professional engineer preparation, free trial',
    ogTitle: 'Join NPPE Pro - Start Your Engineering Success Journey',
    ogDescription: 'Create your account and get access to comprehensive NPPE exam preparation tools. 14-day free trial included.',
    ogImage: 'https://readdy.ai/api/search-image?query=professional%20signup%20registration%20engineering&width=1200&height=630&seq=signup-og&orientation=landscape',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "NPPE Pro Sign Up",
      "description": "Create your account to start NPPE exam preparation",
      "url": `${import.meta.env.VITE_SITE_URL}/signup`,
      "potentialAction": {
        "@type": "RegisterAction",
        "target": `${import.meta.env.VITE_SITE_URL}/signup`,
        "name": "Sign up for NPPE Pro"
      }
    }
  },
  onboarding: {
    title: 'Welcome - NPPE Pro | Setup Your Account',
    description: 'Complete your NPPE Pro account setup and personalize your exam preparation experience.',
    keywords: 'NPPE onboarding, account setup, personalization, engineering exam preparation',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/onboarding`
  },
  achievements: {
    title: 'Achievements - NPPE Pro',
    description: 'Track your achievements and milestones in your NPPE exam preparation journey.',
    keywords: 'NPPE achievements, exam milestones, study progress',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/achievements`
  },
  blog: {
    title: 'Blog - NPPE Pro',
    description: 'Read the latest articles and insights about NPPE exam preparation.',
    keywords: 'NPPE blog, engineering articles, exam tips',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/blog`
  },
  contact: {
    title: 'Contact Us - NPPE Pro',
    description: 'Get in touch with our team for support and inquiries.',
    keywords: 'NPPE contact, support, customer service',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact`
  },
  forum: {
    title: 'Forum - NPPE Pro',
    description: 'Join the community discussion about NPPE exam preparation.',
    keywords: 'NPPE forum, community, discussion',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/forum`
  },
  help: {
    title: 'Help Center - NPPE Pro',
    description: 'Find answers to common questions and get help with NPPE Pro.',
    keywords: 'NPPE help, FAQ, support center',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/help`
  },
  privacyPolicy: {
    title: 'Privacy Policy - NPPE Pro',
    description: 'Read our privacy policy to understand how we protect your data.',
    keywords: 'privacy policy, data protection, NPPE Pro privacy',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/privacy-policy`
  },
  termsOfService: {
    title: 'Terms of Service - NPPE Pro',
    description: 'Read our terms of service and conditions of use.',
    keywords: 'terms of service, conditions, NPPE Pro terms',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/terms-of-service`
  }
};
