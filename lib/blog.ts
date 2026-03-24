import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

export function getAllPosts(): BlogPostMeta[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data } = matter(raw);

    return {
      slug,
      title: data.title ?? 'Untitled',
      date: data.date ?? new Date().toISOString().slice(0, 10),
      excerpt: data.excerpt ?? '',
      author: data.author ?? 'SonoBuddy Team',
      tags: data.tags ?? [],
    } as BlogPostMeta;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDir();
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date ?? new Date().toISOString().slice(0, 10),
    excerpt: data.excerpt ?? '',
    author: data.author ?? 'SonoBuddy Team',
    tags: data.tags ?? [],
    content,
  };
}
