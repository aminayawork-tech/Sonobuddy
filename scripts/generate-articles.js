#!/usr/bin/env node
/**
 * Bundles all content/blog/*.md files into lib/articles-data.ts so that
 * in-app article pages work offline — no fs/server reads at runtime.
 * Run via: npm run generate-articles
 * Also runs automatically as a prebuild step.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const OUT_FILE = path.join(process.cwd(), 'lib/articles-data.ts');

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

const articles = files
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title ?? 'Untitled',
      date: data.date ?? new Date().toISOString().slice(0, 10),
      excerpt: data.excerpt ?? '',
      author: data.author ?? 'SonoBuddy Team',
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: content.trim(),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const output = `// AUTO-GENERATED — do not edit by hand.
// Run \`npm run generate-articles\` (or \`npm run build\`) to regenerate.
// All blog content is inlined here so /articles pages work fully offline.

export interface Article {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

export const ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};

export function getAllArticles(): Omit<Article, 'content'>[] {
  return ARTICLES.map(({ content: _c, ...meta }) => meta);
}

export function getArticleBySlug(slug: string): Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}
`;

fs.writeFileSync(OUT_FILE, output, 'utf8');
console.log(`✓ Generated lib/articles-data.ts (${articles.length} articles)`);
