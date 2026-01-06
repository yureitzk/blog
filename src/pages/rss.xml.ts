import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import { render } from "astro:content";
import { getAllPosts } from '@lib/utils';
import { TITLE, DESCRIPTION, AUTHOR } from '@src/config';
import { createURL } from '@lib/url';

export async function GET(context: APIContext) {
	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });
	const posts = await getAllPosts();
	const site = context.site?.toString() || 'https://example.com';

	const items = [];

	for (const post of posts) {
		const { Content } = await render(post);
		const content = await container.renderToString(Content);
		const link = createURL(site, `/blog/${post.slug}`);
		const title = post.data.title;
		const author = AUTHOR;
		const pubDate = post.data.date;
		const categories = post.data.tags;
		items.push({ ...post.data, title, pubDate, categories, link, author, content });
	}

	return rss({
		title: TITLE,
		description: DESCRIPTION,
		site,
		items,
	});
}
