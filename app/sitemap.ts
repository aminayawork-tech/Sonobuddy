import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

// Blog posts sorted newest-first; highest-priority posts get 0.8, others 0.7
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogUrls: MetadataRoute.Sitemap = posts.map((post, index) => ({
    url: `https://www.sonobuddy.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    // Top 5 newest posts get higher priority
    priority: index < 5 ? 0.8 : 0.7,
  }));

  return [
    // ── Core marketing & app pages ──
    {
      url: 'https://www.sonobuddy.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: 'https://www.sonobuddy.com/home',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // ── App feature pages ──
    {
      url: 'https://www.sonobuddy.com/measurements',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.sonobuddy.com/protocols',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.sonobuddy.com/calculators',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.sonobuddy.com/pathologies',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ── Blog index ──
    {
      url: 'https://www.sonobuddy.com/blog',
      lastModified: posts.length > 0 ? new Date(posts[0].date) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ── Blog posts ──
    ...blogUrls,
  ];
}
