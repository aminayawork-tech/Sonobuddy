import { ARTICLES } from '@/lib/articles-data';

export interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

// How many articles use each tag, so a rare, specific tag ("vascular access",
// on 2 articles) outweighs a generic one ("protocol", on 50+).
const TAG_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const a of ARTICLES) {
    new Set(a.tags.map((tag) => tag.toLowerCase())).forEach((t) => {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
  }
  return counts;
})();

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'what', 'when', 'how', 'your', 'you', 'are', 'from', 'into',
  'that', 'this', 'its', 'not', 'can', 'who', 'why', 'all', 'about', 'guide', 'ultrasound',
  'sonographer', 'sonographers', 'sonography', 'scan', 'exam',
]);

function words(a: { title: string; excerpt: string }): Set<string> {
  return new Set(
    `${a.title} ${a.excerpt}`.toLowerCase().split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );
}

// Same idea for words in titles and summaries: a shared "picc" or "fistula"
// says far more about relatedness than a shared "normal" or "values".
const ARTICLE_WORDS = new Map(ARTICLES.map((a) => [a.slug, words(a)]));
const WORD_COUNTS = (() => {
  const counts = new Map<string, number>();
  ARTICLE_WORDS.forEach((ws) => ws.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1)));
  return counts;
})();

/**
 * Articles most related to `slug` by shared tags and title/summary words,
 * rarer ones weighing more, newest first among ties. Only returns metadata,
 * so callers never ship other articles' full content to the client.
 */
export function getRelatedArticles(slug: string, limit = 3): RelatedArticle[] {
  const today = new Date().toISOString().slice(0, 10);
  const current = ARTICLES.find((a) => a.slug === slug);
  const tags = new Set((current?.tags ?? []).map((t) => t.toLowerCase()));
  const total = ARTICLES.length;
  const ownWords = ARTICLE_WORDS.get(slug) ?? new Set<string>();
  const idf = (count: number | undefined) => Math.log(total / (count ?? total));

  const candidates = ARTICLES
    .filter((a) => a.slug !== slug && a.date <= today)
    .map((a) => ({
      article: a,
      score:
        a.tags
          .map((t) => t.toLowerCase())
          .filter((t) => tags.has(t))
          .reduce((sum, t) => sum + idf(TAG_COUNTS.get(t)), 0)
        // Words count for less than tags, which are chosen deliberately.
        + 0.5 * Array.from(ARTICLE_WORDS.get(a.slug) ?? [])
          .filter((w) => ownWords.has(w))
          .reduce((sum, w) => sum + idf(WORD_COUNTS.get(w)), 0),
    }))
    .sort((x, y) => y.score - x.score || (x.article.date < y.article.date ? 1 : -1));

  return candidates.slice(0, limit).map(({ article: { slug: s, title, excerpt, date } }) => ({
    slug: s, title, excerpt, date,
  }));
}
