import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';
import { SITE } from '../lib/site';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/${post.id}/`,
    })),
  });
}
