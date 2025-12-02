export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SRMIST OS Virtual Shell',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal powered by WebContainers. Learn OS concepts through 15 hands-on experiments.',
    featureList: [
      'Real Linux Terminal',
      'WebContainer Technology',
      '15 Interactive Experiments',
      'Shell Programming',
      'Process Management',
      'CPU Scheduling Algorithms',
      'Memory Management',
      'Disk Scheduling',
      'File Systems',
      'Zero Setup Required',
      'Browser-based Learning',
    ],
    provider: {
      '@type': 'EducationalOrganization',
      name: 'SRM Institute of Science and Technology',
      department: {
        '@type': 'Organization',
        name: 'School of Computing',
      },
    },
    educationalLevel: 'Undergraduate',
    learningResourceType: 'Interactive Lab',
    interactivityType: 'active',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
  };

  const courseData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Operating Systems Virtual Laboratory',
    description: 'Comprehensive hands-on course covering operating system concepts through interactive experiments',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'SRM Institute of Science and Technology',
    },
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT15H',
      },
    ],
    educationalLevel: 'Undergraduate',
    about: [
      {
        '@type': 'Thing',
        name: 'Operating Systems',
      },
      {
        '@type': 'Thing',
        name: 'Computer Science',
      },
    ],
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: '/',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}
