import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/proyectos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...projects.map(p => ({
      url: `${site.url}/proyectos/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p.featured ? 0.8 : 0.6,
    })),
  ];
}
